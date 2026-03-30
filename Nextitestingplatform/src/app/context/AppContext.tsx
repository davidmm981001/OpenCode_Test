import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { mockProjects, mockRoles, mockProgrammingLanguages, Project, AIRole, ProgrammingLanguage } from '../data/mockData';
import type { Requirement } from '../types/requirements';
import { loadZipToFileMap, type ZipFileMap } from '../lib/zipArchetype';
import type { ProjectFrameworkCategoryPersisted } from '../lib/projectFrameworkArchetypeSelection';
import type { DocumentationRun, TestCase, UserStory } from '../types/usTcFlow';
import { getSupabaseClient } from '../lib/supabaseClient';
import {
  JiraSyncServiceError,
  mapUserStoriesToJiraInput,
  syncStoriesToJira,
} from '../services/jiraSyncService';
import {
  listProjects,
  listRequirements,
  listUserStories,
  listTestCases,
  listDocumentationRuns,
  upsertProject,
  upsertProjectJiraConnection,
  insertRequirement,
  updateRequirement as dbUpdateRequirement,
  deleteRequirement as dbDeleteRequirement,
  insertUserStories,
  updateUserStory as dbUpdateUserStory,
  syncUserStoriesToJira as dbSyncUserStoriesToJira,
  deleteUserStory as dbDeleteUserStory,
  deleteUserStoriesByProject as dbDeleteUserStoriesByProject,
  insertTestCases as dbInsertTestCases,
  updateTestCase as dbUpdateTestCase,
  upsertDocumentationRun,
} from '../lib/repositories/workspaceRepository';


const PROJECTS_STORAGE_KEY = 'nexti_projects_v1';
const REQUIREMENTS_STORAGE_KEY = 'nexti_requirements_v1';
const USER_STORIES_STORAGE_KEY = 'nexti_user_stories_v1';
const TEST_CASES_STORAGE_KEY = 'nexti_test_cases_v1';
const DOCUMENTATION_RUNS_STORAGE_KEY = 'nexti_documentation_runs_v1';
const AUTH_STORAGE_KEY = 'nexti_auth';

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Project[];
  } catch {
    // corrupted storage — fall back to mock data
  }
  return mockProjects;
}

function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // storage full or unavailable — silent fail
  }
}

function loadRequirements(): Requirement[] {
  try {
    const raw = localStorage.getItem(REQUIREMENTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Requirement[];
  } catch {
    // corrupted storage — fall back to empty requirements
  }
  return [];
}

function saveRequirements(requirements: Requirement[]) {
  try {
    localStorage.setItem(REQUIREMENTS_STORAGE_KEY, JSON.stringify(requirements));
  } catch {
    // storage full or unavailable — silent fail
  }
}

function loadUserStories(): UserStory[] {
  try {
    const raw = localStorage.getItem(USER_STORIES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserStory[];
  } catch {
    return [];
  }
}

function saveUserStories(stories: UserStory[]) {
  try {
    localStorage.setItem(USER_STORIES_STORAGE_KEY, JSON.stringify(stories));
  } catch {
    // silent
  }
}

function loadTestCases(): TestCase[] {
  try {
    const raw = localStorage.getItem(TEST_CASES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TestCase[];
  } catch {
    return [];
  }
}

function saveTestCases(testCases: TestCase[]) {
  try {
    localStorage.setItem(TEST_CASES_STORAGE_KEY, JSON.stringify(testCases));
  } catch {
    // silent
  }
}

function loadDocumentationRuns(): DocumentationRun[] {
  try {
    const raw = localStorage.getItem(DOCUMENTATION_RUNS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DocumentationRun[];
  } catch {
    return [];
  }
}

function saveDocumentationRuns(runs: DocumentationRun[]) {
  try {
    localStorage.setItem(DOCUMENTATION_RUNS_STORAGE_KEY, JSON.stringify(runs));
  } catch {
    // silent
  }
}

const PROJECT_FRAMEWORK_SELECTION_KEY = 'nexti_project_framework_selection_v1';

function loadProjectFrameworkSelection(): Record<string, ProjectFrameworkCategoryPersisted> {
  try {
    const raw = localStorage.getItem(PROJECT_FRAMEWORK_SELECTION_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ProjectFrameworkCategoryPersisted>;
  } catch {
    return {};
  }
}

function saveProjectFrameworkSelection(data: Record<string, ProjectFrameworkCategoryPersisted>) {
  try {
    localStorage.setItem(PROJECT_FRAMEWORK_SELECTION_KEY, JSON.stringify(data));
  } catch {
    // silent
  }
}

interface AppContextType {
  projects: Project[];
  aiRoles: AIRole[];
  programmingLanguages: ProgrammingLanguage[];
  requirements: Requirement[];
  userStories: UserStory[];
  testCases: TestCase[];
  documentationRuns: DocumentationRun[];
  /**
   * In-memory project archetypes (loaded from ZIPs).
   * Note: we intentionally do NOT persist to localStorage because ZIP contents can be large.
   */
  projectArchetypes: Record<string, Record<string, ZipFileMap | null>>;
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;

  // Requirements CRUD (persisted per project)
  addRequirement: (
    projectId: string,
    requirement: Omit<Requirement, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
  ) => Requirement;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  addUserStories: (
    projectId: string,
    stories: Array<
      Omit<
        UserStory,
        'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'jiraId' | 'jiraSyncStatus' | 'sourceRunId'
      >
    >,
    sourceRunId?: string | null,
  ) => UserStory[];
  updateUserStory: (id: string, updates: Partial<UserStory>) => void;
  deleteUserStory: (id: string) => void;
  deleteUserStoriesByProject: (projectId: string) => void;
  syncUserStoriesToJira: (ids: string[]) => Promise<void>;
  addTestCases: (
    projectId: string,
    testCases: Array<
      Omit<
        TestCase,
        'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'automationStatus' | 'sourceRunId'
      >
    >,
    sourceRunId?: string | null,
  ) => TestCase[];
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  saveDocumentationRun: (run: Omit<DocumentationRun, 'id' | 'createdAt'>) => DocumentationRun;
  addRole: (role: Omit<AIRole, 'id' | 'createdAt'>) => void;
  updateRole: (id: string, updates: Partial<AIRole>) => void;
  deleteRole: (id: string) => void;
  addProgrammingLanguage: (lang: Omit<ProgrammingLanguage, 'id' | 'createdAt'>) => void;
  updateProgrammingLanguage: (id: string, updates: Partial<ProgrammingLanguage>) => void;
  deleteProgrammingLanguage: (id: string) => void;

  setProjectArchetypeFileMap: (projectId: string, framework: string, map: ZipFileMap | null) => void;

  /** Saved API/Web/Performance framework picks per project (arquetipos sheet + Scripts tab). */
  getProjectFrameworkSelection: (projectId: string) => ProjectFrameworkCategoryPersisted | undefined;
  setProjectFrameworkSelection: (
    projectId: string,
    selection: ProjectFrameworkCategoryPersisted,
  ) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabaseEnabled = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [aiRoles, setAiRoles] = useState<AIRole[]>(mockRoles);
  const [programmingLanguages, setProgrammingLanguages] = useState<ProgrammingLanguage[]>(mockProgrammingLanguages);
  const [requirements, setRequirements] = useState<Requirement[]>(loadRequirements);
  const [userStories, setUserStories] = useState<UserStory[]>(loadUserStories);
  const [testCases, setTestCases] = useState<TestCase[]>(loadTestCases);
  const [documentationRuns, setDocumentationRuns] = useState<DocumentationRun[]>(loadDocumentationRuns);
  const [projectArchetypes, setProjectArchetypes] = useState<
    Record<string, Record<string, ZipFileMap | null>>
  >({});
  const [projectFrameworkSelection, setProjectFrameworkSelectionState] = useState<
    Record<string, ProjectFrameworkCategoryPersisted>
  >(() => (supabaseEnabled ? {} : loadProjectFrameworkSelection()));
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    supabaseEnabled ? false : localStorage.getItem(AUTH_STORAGE_KEY) === 'true',
  );

  const login = async (email?: string, password?: string) => {
    if (!supabaseEnabled) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      return;
    }

    if (!email || !password) {
      throw new Error('Missing email/password for Supabase login.');
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Auth state changes will populate `supabaseUserId`.
    setIsAuthenticated(true);
  };

  const logout = async () => {
    if (!supabaseEnabled) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsAuthenticated(false);
      return;
    }

    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setSupabaseUserId(null);
    setIsAuthenticated(false);
  };

  // Keep auth state in sync (Supabase) so we know which user's rows to load.
  useEffect(() => {
    if (!supabaseEnabled) return;

    const supabase = getSupabaseClient();

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id ?? null;
      setSupabaseUserId(userId);
      setIsAuthenticated(!!userId);
    };

    void loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null;
      setSupabaseUserId(userId);
      setIsAuthenticated(!!userId);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseEnabled]);

  // Load workspace state from Postgres when auth is available.
  useEffect(() => {
    if (!supabaseEnabled) return;

    if (!supabaseUserId) {
      setProjects([]);
      setRequirements([]);
      setUserStories([]);
      setTestCases([]);
      setDocumentationRuns([]);
      setProjectFrameworkSelectionState({});
      return;
    }

    const supabase = getSupabaseClient();

    const load = async () => {
      const [p, r, s, t, d] = await Promise.all([
        listProjects(supabaseUserId),
        listRequirements(supabaseUserId),
        listUserStories(supabaseUserId),
        listTestCases(supabaseUserId),
        listDocumentationRuns(supabaseUserId),
      ]);

      setProjects(p);
      setProjectFrameworkSelectionState(prev => {
        const remote: Record<string, ProjectFrameworkCategoryPersisted> = {};
        for (const pr of p) {
          if (pr.frameworkSelection) {
            remote[pr.id] = pr.frameworkSelection;
          }
        }
        // Remote wins when present; keep local as fallback.
        return { ...prev, ...remote };
      });
      setRequirements(r);
      setUserStories(s);
      setTestCases(t);
      setDocumentationRuns(d);

      // Load archetype ZIPs (metadata in Postgres, ZIP content in Storage).
      try {
        const projectIds = p.map(pr => pr.id);
        if (projectIds.length === 0) {
          setProjectArchetypes({});
          return;
        }

        const { data: archetypeRows, error: archErr } = await supabase
          .from('archetype_zips')
          .select('project_id,framework_slot,storage_path,file_name,uploaded_at')
          .eq('owner_user_id', supabaseUserId)
          .in('project_id', projectIds)
          .order('uploaded_at', { ascending: false });

        if (archErr) throw archErr;

        const nextProjectArchetypes: Record<string, Record<string, ZipFileMap | null>> = {};

        for (const row of archetypeRows ?? []) {
          const projectId = String(row.project_id);
          const slotId = String(row.framework_slot);

          // Keep only the latest ZIP per slot (ordered by uploaded_at desc).
          if (nextProjectArchetypes[projectId]?.[slotId] !== undefined) continue;

          const storagePath = String(row.storage_path);
          const fileName = String(row.file_name ?? 'archetype.zip');

          const { data: blob, error: dlErr } = await supabase.storage
            .from('archetypes')
            .download(storagePath);

          if (dlErr || !blob) {
            nextProjectArchetypes[projectId] ||= {};
            nextProjectArchetypes[projectId][slotId] = null;
            continue;
          }

          const file = new File([blob], fileName, { type: 'application/zip' });
          const map = await loadZipToFileMap(file);

          nextProjectArchetypes[projectId] ||= {};
          nextProjectArchetypes[projectId][slotId] = map;
        }

        setProjectArchetypes(nextProjectArchetypes);
      } catch (err) {
        console.error('Failed to load archetypes from Supabase:', err);
      }
    };

    void load().catch(err => {
      // If the DB is not ready yet, keep UI usable from any existing local state.
      console.error('Failed to load workspace from Supabase:', err);
    });
  }, [supabaseEnabled, supabaseUserId]);

  // Persist projects to localStorage on every change
  useEffect(() => {
    if (supabaseEnabled) return;
    saveProjects(projects);
  }, [projects, supabaseEnabled]);

  // Persist requirements to localStorage on every change
  useEffect(() => {
    if (supabaseEnabled) return;
    saveRequirements(requirements);
  }, [requirements, supabaseEnabled]);

  useEffect(() => {
    if (supabaseEnabled) return;
    saveUserStories(userStories);
  }, [userStories, supabaseEnabled]);

  useEffect(() => {
    if (supabaseEnabled) return;
    saveTestCases(testCases);
  }, [testCases, supabaseEnabled]);

  useEffect(() => {
    if (supabaseEnabled) return;
    saveDocumentationRuns(documentationRuns);
  }, [documentationRuns, supabaseEnabled]);

  useEffect(() => {
    if (supabaseEnabled) return;
    saveProjectFrameworkSelection(projectFrameworkSelection);
  }, [projectFrameworkSelection, supabaseEnabled]);

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: String(Date.now()),
    };
    setProjects(prev => [newProject, ...prev]);

    if (supabaseEnabled && supabaseUserId) {
      void upsertProject(supabaseUserId, newProject).catch(err => {
        console.error('Failed to upsert project:', err);
      });
        void upsertProjectJiraConnection(supabaseUserId, newProject.id, newProject.jiraConfig).catch(err => {
          console.error('Failed to upsert Jira project connection:', err);
        });
    }
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => {
      const next = prev.map(p => (p.id === id ? { ...p, ...updates } : p));
      const updated = next.find(p => p.id === id);
      if (supabaseEnabled && supabaseUserId && updated) {
        void upsertProject(supabaseUserId, updated).catch(err => {
          console.error('Failed to upsert project:', err);
        });
        void upsertProjectJiraConnection(supabaseUserId, updated.id, updated.jiraConfig).catch(err => {
          console.error('Failed to upsert Jira project connection:', err);
        });
      }
      return next;
    });
  };

  const addRole = (role: Omit<AIRole, 'id' | 'createdAt'>) => {
    const newRole: AIRole = {
      ...role,
      id: String(Date.now()),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAiRoles(prev => [...prev, newRole]);
  };

  const updateRole = (id: string, updates: Partial<AIRole>) => {
    setAiRoles(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteRole = (id: string) => {
    setAiRoles(prev => prev.filter(r => r.id !== id));
  };

  const addProgrammingLanguage = (lang: Omit<ProgrammingLanguage, 'id' | 'createdAt'>) => {
    const newLang: ProgrammingLanguage = {
      ...lang,
      id: `pl-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProgrammingLanguages(prev => [...prev, newLang]);
  };

  const updateProgrammingLanguage = (id: string, updates: Partial<ProgrammingLanguage>) => {
    setProgrammingLanguages(prev =>
      prev.map(l => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const deleteProgrammingLanguage = (id: string) => {
    setProgrammingLanguages(prev => prev.filter(l => l.id !== id));
  };

  const addRequirement = (
    projectId: string,
    requirement: Omit<Requirement, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
  ) => {
    const now = new Date().toISOString();
    const newRequirement: Requirement = {
      ...requirement,
      id: String(Date.now()),
      projectId,
      createdAt: now,
      updatedAt: now,
    };
    setRequirements(prev => [newRequirement, ...prev]);

    if (supabaseEnabled && supabaseUserId) {
      void insertRequirement(supabaseUserId, newRequirement).catch(err => {
        console.error('Failed to insert requirement:', err);
      });
    }

    return newRequirement;
  };

  const updateRequirement = (id: string, updates: Partial<Requirement>) => {
    const updatedAt = new Date().toISOString();
    setRequirements(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates, updatedAt } : r)),
    );

    if (supabaseEnabled && supabaseUserId) {
      void dbUpdateRequirement(supabaseUserId, id, updates).catch(err => {
        console.error('Failed to update requirement:', err);
      });
    }
  };

  const deleteRequirement = (id: string) => {
    setRequirements(prev => prev.filter(r => r.id !== id));

    if (supabaseEnabled && supabaseUserId) {
      void dbDeleteRequirement(supabaseUserId, id).catch(err => {
        console.error('Failed to delete requirement:', err);
      });
    }
  };

  const addUserStories = (
    projectId: string,
    stories: Array<
      Omit<
        UserStory,
        'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'jiraId' | 'jiraSyncStatus' | 'sourceRunId'
      >
    >,
    sourceRunId: string | null = null,
  ) => {
    const now = new Date().toISOString();
    const newStories: UserStory[] = stories.map((story, idx) => ({
      ...story,
      id: `US-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 9)}`}`,
      projectId,
      jiraId: null,
      jiraSyncStatus: 'pending',
      sourceRunId,
      createdAt: now,
      updatedAt: now,
    }));
    setUserStories(prev => [...newStories, ...prev]);

    if (supabaseEnabled && supabaseUserId) {
      void insertUserStories(supabaseUserId, newStories).catch(err => {
        console.error('Failed to insert user stories:', err);
      });
    }

    return newStories;
  };

  const updateUserStory = (id: string, updates: Partial<UserStory>) => {
    const updatedAt = new Date().toISOString();
    setUserStories(prev =>
      prev.map(story => (story.id === id ? { ...story, ...updates, updatedAt } : story)),
    );

    if (supabaseEnabled && supabaseUserId) {
      void dbUpdateUserStory(supabaseUserId, id, updates).catch(err => {
        console.error('Failed to update user story:', err);
      });
    }
  };

  const deleteUserStory = (id: string) => {
    setUserStories(prev => prev.filter(story => story.id !== id));

    if (supabaseEnabled && supabaseUserId) {
      void dbDeleteUserStory(supabaseUserId, id).catch(err => {
        console.error('Failed to delete user story:', err);
      });
    }
  };

  const deleteUserStoriesByProject = (projectId: string) => {
    setUserStories(prev => prev.filter(story => story.projectId !== projectId));

    if (supabaseEnabled && supabaseUserId) {
      void dbDeleteUserStoriesByProject(supabaseUserId, projectId).catch(err => {
        console.error('Failed to delete user stories by project:', err);
      });
    }
  };

  const syncUserStoriesToJira = async (ids: string[]) => {
    const targets = userStories.filter(s => ids.includes(s.id));
    if (targets.length === 0) return;

    const projectId = targets[0].projectId;
    const project = projects.find(p => p.id === projectId);
    if (
      !project?.jiraConfig ||
      !project.jiraConfig.baseUrl?.trim() ||
      !project.jiraConfig.projectKey?.trim() ||
      !project.jiraConfig.storyIssueType?.trim() ||
      !project.jiraConfig.jiraUserEmail?.trim() ||
      !project.jiraConfig.credentialId
    ) {
      const updatedAt = new Date().toISOString();
      setUserStories(prev =>
        prev.map(story =>
          ids.includes(story.id)
            ? { ...story, jiraSyncStatus: 'failed', updatedAt }
            : story,
        ),
      );
      throw new Error('Configure Jira connection and credentials before syncing.');
    }

    const pendingAt = new Date().toISOString();
    setUserStories(prev =>
      prev.map(story =>
        ids.includes(story.id)
          ? { ...story, jiraSyncStatus: 'pending', updatedAt: pendingAt }
          : story,
      ),
    );

    try {
      const result = await syncStoriesToJira({
        requestId: crypto.randomUUID(),
        projectId,
        stories: mapUserStoriesToJiraInput(targets),
      });

      const syncMap = new Map(result.synced.map((s) => [s.storyId, s.jiraKey]));
      const failedSet = new Set(result.failed.map((f) => f.storyId));
      const updatedAt = new Date().toISOString();
      setUserStories(prev =>
        prev.map(story => {
          if (!ids.includes(story.id)) return story;
          if (syncMap.has(story.id)) {
            return {
              ...story,
              jiraId: syncMap.get(story.id) ?? story.jiraId,
              jiraSyncStatus: 'synced',
              updatedAt,
            };
          }
          if (failedSet.has(story.id)) {
            return { ...story, jiraSyncStatus: 'failed', updatedAt };
          }
          return story;
        }),
      );

      if (supabaseEnabled && supabaseUserId) {
        await dbSyncUserStoriesToJira(
          supabaseUserId,
          result.synced.map((s) => s.storyId),
          (id) => syncMap.get(id) ?? `JIRA-${id}`,
        );
        for (const f of result.failed) {
          await dbUpdateUserStory(supabaseUserId, f.storyId, { jiraSyncStatus: 'failed' });
        }
      }
    } catch (err) {
      const updatedAt = new Date().toISOString();
      setUserStories(prev =>
        prev.map(story =>
          ids.includes(story.id)
            ? { ...story, jiraSyncStatus: 'failed', updatedAt }
            : story,
        ),
      );
      if (err instanceof JiraSyncServiceError) {
        throw new Error(err.message);
      }
      throw err;
    }
  };

  const addTestCases = (
    projectId: string,
    nextTestCases: Array<
      Omit<
        TestCase,
        'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'automationStatus' | 'sourceRunId'
      >
    >,
    sourceRunId: string | null = null,
  ) => {
    const now = new Date().toISOString();
    const created: TestCase[] = nextTestCases.map((tc, idx) => ({
      ...tc,
      id: `TC-${Date.now()}-${idx}`,
      projectId,
      automationStatus: 'pending',
      sourceRunId,
      createdAt: now,
      updatedAt: now,
    }));
    setTestCases(prev => [...created, ...prev]);

    if (supabaseEnabled && supabaseUserId) {
      void dbInsertTestCases(supabaseUserId, created).catch(err => {
        console.error('Failed to insert test cases:', err);
      });
    }

    return created;
  };

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    const updatedAt = new Date().toISOString();
    setTestCases(prev => prev.map(tc => (tc.id === id ? { ...tc, ...updates, updatedAt } : tc)));

    if (supabaseEnabled && supabaseUserId) {
      void dbUpdateTestCase(supabaseUserId, id, updates).catch(err => {
        console.error('Failed to update test case:', err);
      });
    }
  };

  const saveDocumentationRun = (run: Omit<DocumentationRun, 'id' | 'createdAt'>) => {
    const created: DocumentationRun = {
      ...run,
      id: `RUN-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDocumentationRuns(prev => [created, ...prev]);

    if (supabaseEnabled && supabaseUserId) {
      void upsertDocumentationRun(supabaseUserId, created).catch(err => {
        console.error('Failed to upsert documentation run:', err);
      });
    }

    return created;
  };

  const setProjectArchetypeFileMap = (
    projectId: string,
    framework: string,
    map: ZipFileMap | null,
  ) => {
    setProjectArchetypes(prev => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] ?? {}),
        [framework]: map,
      },
    }));
  };

  const getProjectFrameworkSelection = useCallback(
    (projectId: string) => projectFrameworkSelection[projectId],
    [projectFrameworkSelection],
  );

  const setProjectFrameworkSelection = useCallback(
    (projectId: string, selection: ProjectFrameworkCategoryPersisted) => {
      setProjectFrameworkSelectionState(prev => ({
        ...prev,
        [projectId]: selection,
      }));
      setProjects(prev => {
        const next = prev.map(p =>
          p.id === projectId ? { ...p, frameworkSelection: selection } : p,
        );
        const updated = next.find(p => p.id === projectId);
        if (supabaseEnabled && supabaseUserId && updated) {
          void upsertProject(supabaseUserId, updated).catch(err => {
            console.error('Failed to persist framework selection:', err);
          });
        }
        return next;
      });
    },
    [supabaseEnabled, supabaseUserId],
  );

  return (
    <AppContext.Provider
      value={{
        projects,
        aiRoles,
        programmingLanguages,
        requirements,
        userStories,
        testCases,
        documentationRuns,
        projectArchetypes,
        isAuthenticated,
        login,
        logout,
        addProject,
        updateProject,
        addRequirement,
        updateRequirement,
        deleteRequirement,
        addUserStories,
        updateUserStory,
        deleteUserStory,
        deleteUserStoriesByProject,
        syncUserStoriesToJira,
        addTestCases,
        updateTestCase,
        saveDocumentationRun,
        addRole,
        updateRole,
        deleteRole,
        addProgrammingLanguage,
        updateProgrammingLanguage,
        deleteProgrammingLanguage,
        setProjectArchetypeFileMap,
        getProjectFrameworkSelection,
        setProjectFrameworkSelection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}