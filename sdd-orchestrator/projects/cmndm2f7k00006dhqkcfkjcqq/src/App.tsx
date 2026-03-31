import { FormEvent, useEffect, useMemo, useState } from 'react';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

const STORAGE_KEY = 'todo-full-app:v1';

function readTodos(): Todo[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (todo): todo is Todo =>
        typeof todo === 'object' &&
        todo !== null &&
        'id' in todo &&
        'text' in todo &&
        'completed' in todo &&
        typeof todo.id === 'string' &&
        typeof todo.text === 'string' &&
        typeof todo.completed === 'boolean',
    );
  } catch {
    return [];
  }
}

function createTodo(text: string): Todo {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    completed: false,
  };
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(readTodos);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = draft.trim();
    if (!text) {
      return;
    }

    setTodos((current) => [createTodo(text), ...current]);
    setDraft('');
  };

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  };

  return (
    <main className="app-shell">
      <section className="todo-card" aria-labelledby="todo-title">
        <div className="todo-header">
          <p className="eyebrow">Entrega funcional</p>
          <h1 id="todo-title">Lista de tareas</h1>
          <p className="subtitle">Agrega, completa y elimina tareas. Todo queda guardado localmente.</p>
        </div>

        <form className="todo-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="todo-input">Nueva tarea</label>
          <input
            id="todo-input"
            name="todo"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribe una tarea"
            autoComplete="off"
          />
          <button type="submit">Agregar</button>
        </form>

        <div className="todo-summary" aria-live="polite">
          {todos.length === 0 ? 'No hay tareas todavía.' : `${remainingCount} pendientes de ${todos.length}`}
        </div>

        <ul className="todo-list" aria-label="Tareas">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'todo-item completed' : 'todo-item'}>
              <label className="todo-check">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  aria-label={`Marcar ${todo.text}`}
                />
                <span>{todo.text}</span>
              </label>
              <button type="button" className="delete-button" onClick={() => deleteTodo(todo.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
