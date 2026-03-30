import React from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { JiraSyncServiceError, testJiraConnection, upsertJiraCredential } from '../services/jiraSyncService';

export default function ProjectJiraPlaceholderPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, updateProject } = useApp();
  const project = projects.find((p) => p.id === projectId);
  const [baseUrl, setBaseUrl] = React.useState(() => project?.jiraConfig?.baseUrl ?? '');
  const [projectKey, setProjectKey] = React.useState(() => project?.jiraConfig?.projectKey ?? '');
  const [issueType, setIssueType] = React.useState(() => project?.jiraConfig?.storyIssueType ?? 'Story');
  const [labels, setLabels] = React.useState(() => (project?.jiraConfig?.defaultLabels ?? []).join(','));
  const [jiraUserEmail, setJiraUserEmail] = React.useState(() => project?.jiraConfig?.jiraUserEmail ?? '');
  const [jiraToken, setJiraToken] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const [credentialSaved, setCredentialSaved] = React.useState(false);
  const [credentialStatus, setCredentialStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [credentialMessage, setCredentialMessage] = React.useState('');
  const [isSavingCredential, setIsSavingCredential] = React.useState(false);
  const hasStoredCredential = Boolean(project?.jiraConfig?.credentialId);
  const [testStatus, setTestStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = React.useState('');
  const [isTesting, setIsTesting] = React.useState(false);
  const ISSUE_TYPE_PRESETS = ['Story', 'Bug', 'Task', 'Epic', 'Sub-task'] as const;
  const CUSTOM_ISSUE_TYPE_VALUE = '__custom__';
  const trimmedIssueType = issueType.trim();
  const isCustomIssueType = !ISSUE_TYPE_PRESETS.includes(trimmedIssueType as (typeof ISSUE_TYPE_PRESETS)[number]);
  const selectIssueTypeValue = isCustomIssueType ? CUSTOM_ISSUE_TYPE_VALUE : trimmedIssueType;
  const isReady =
    Boolean(project?.jiraConfig?.baseUrl?.trim()) &&
    Boolean(project?.jiraConfig?.projectKey?.trim()) &&
    Boolean(project?.jiraConfig?.storyIssueType?.trim()) &&
    Boolean(project?.jiraConfig?.jiraUserEmail?.trim()) &&
    hasStoredCredential;

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const handleSave = () => {
    setSaved(false);
    const cleanLabels = labels
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    updateProject(project.id, {
      jiraConfig:
        baseUrl.trim() && projectKey.trim() && issueType.trim()
          ? {
              baseUrl: baseUrl.trim(),
              projectKey: projectKey.trim().toUpperCase(),
              storyIssueType: issueType.trim(),
              ...(jiraUserEmail.trim() ? { jiraUserEmail: jiraUserEmail.trim() } : {}),
              ...(typeof project?.jiraConfig?.credentialId === 'number'
                ? { credentialId: Math.trunc(project.jiraConfig.credentialId) }
                : {}),
              ...(cleanLabels.length ? { defaultLabels: cleanLabels } : {}),
            }
          : undefined,
    });
    setSaved(true);
    setCredentialSaved(false);
    setTestStatus('idle');
    setTestMessage('');
  };

  const handleSaveCredential = async () => {
    setCredentialSaved(false);
    setCredentialStatus('idle');
    setCredentialMessage('');
    if (!project?.jiraConfig?.baseUrl?.trim() || !project?.jiraConfig?.projectKey?.trim() || !project?.jiraConfig?.storyIssueType?.trim()) {
      setCredentialStatus('error');
      setCredentialMessage('Save Jira project configuration before saving credentials.');
      return;
    }
    if (!jiraUserEmail.trim() || !jiraToken.trim()) {
      setCredentialStatus('error');
      setCredentialMessage('Jira user email and Jira token are required.');
      return;
    }
    setIsSavingCredential(true);
    try {
      const result = await upsertJiraCredential({
        projectId: project.id,
        jiraUserEmail: jiraUserEmail.trim(),
        jiraToken: jiraToken.trim(),
      });
      updateProject(project.id, {
        jiraConfig: {
          ...(project.jiraConfig ?? {
            baseUrl: baseUrl.trim(),
            projectKey: projectKey.trim().toUpperCase(),
            storyIssueType: issueType.trim(),
          }),
          jiraUserEmail: jiraUserEmail.trim(),
          ...(typeof result.credentialId === 'number' ? { credentialId: result.credentialId } : {}),
        },
      });
      setJiraToken('');
      setCredentialSaved(true);
      setCredentialStatus('success');
      setCredentialMessage('Credential saved securely on backend.');
    } catch (error) {
      setCredentialStatus('error');
      if (error instanceof JiraSyncServiceError) {
        setCredentialMessage(error.message);
      } else {
        setCredentialMessage(error instanceof Error ? error.message : 'Unknown credential save error.');
      }
    } finally {
      setIsSavingCredential(false);
    }
  };

  const handleTestConnection = async () => {
    if (!isReady) {
      setTestStatus('error');
      setTestMessage('Save a complete Jira configuration first.');
      return;
    }
    setIsTesting(true);
    setTestStatus('idle');
    setTestMessage('');
    try {
      const result = await testJiraConnection(project.id);
      setTestStatus(result.ok ? 'success' : 'error');
      setTestMessage(result.message);
    } catch (error) {
      setTestStatus('error');
      if (error instanceof JiraSyncServiceError) {
        setTestMessage(error.message);
      } else {
        setTestMessage(error instanceof Error ? error.message : 'Unknown connection test error.');
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6">
      <div
        className="bg-white rounded-lg p-6 space-y-5"
        style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div>
          <h3 className="text-foreground mb-2">Integración Jira</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Configure Jira para sincronizar historias del proyecto <strong>{project.name}</strong>.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="jira-base-url">Jira Base URL</Label>
            <Input
              id="jira-base-url"
              type="url"
              placeholder="https://your-domain.atlassian.net"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jira-project-key">Project Key</Label>
            <Input
              id="jira-project-key"
              placeholder="PROJ"
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Issue Type</Label>
            <Select
              value={selectIssueTypeValue}
              onValueChange={(v) => {
                if (v === CUSTOM_ISSUE_TYPE_VALUE) setIssueType('');
                else setIssueType(v);
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPE_PRESETS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_ISSUE_TYPE_VALUE}>Custom</SelectItem>
              </SelectContent>
            </Select>
            {isCustomIssueType && (
              <Input
                id="jira-issue-type-custom"
                placeholder="Custom Jira issue type"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jira-labels">Default Labels (comma separated)</Label>
            <Input
              id="jira-labels"
              placeholder="nexti,automation"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jira-user-email">Jira User Email</Label>
            <Input
              id="jira-user-email"
              type="email"
              placeholder="qa.user@company.com"
              value={jiraUserEmail}
              onChange={(e) => setJiraUserEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="jira-token">Jira Token (stored encrypted in backend)</Label>
            <Input
              id="jira-token"
              type="password"
              placeholder="Paste Jira API token"
              value={jiraToken}
              onChange={(e) => setJiraToken(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Guardar configuración Jira</Button>
          <Button variant="secondary" onClick={handleSaveCredential} disabled={isSavingCredential}>
            {isSavingCredential ? 'Guardando credencial...' : 'Guardar credencial'}
          </Button>
          <Button variant="outline" onClick={handleTestConnection} disabled={!isReady || isTesting}>
            {isTesting ? 'Probando...' : 'Test connection'}
          </Button>
          {saved && <span className="text-xs text-emerald-700">Guardado</span>}
          {credentialSaved && <span className="text-xs text-emerald-700">Credencial guardada</span>}
        </div>
        {credentialStatus !== 'idle' && (
          <div
            className={`rounded-md border px-3 py-2 text-xs ${
              credentialStatus === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {credentialMessage}
          </div>
        )}
        {testStatus !== 'idle' && (
          <div
            className={`rounded-md border px-3 py-2 text-xs ${
              testStatus === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {testMessage}
          </div>
        )}
        <div
          className={`rounded-md border px-3 py-2 text-xs ${
            isReady
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {isReady
            ? 'Jira connection is ready for backend sync.'
            : 'Jira connection incomplete: add base URL, project key, issue type, Jira user email, and save the Jira token.'}
        </div>
        <p className="text-xs text-muted-foreground">
          The Jira token is write-only in this UI and stored encrypted in Supabase by backend functions.
        </p>
        <p className="text-sm text-muted-foreground">
          Puede continuar en{' '}
          <Link to={`/projects/${project.id}/stories`} className="underline">
            Historias
          </Link>{' '}
          para ejecutar la sincronización.
        </p>
      </div>
    </div>
  );
}
