const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-muted/60 px-4 py-3 text-center text-xs text-muted-foreground">
      <p>
        <span className="font-medium text-foreground">NexTI</span>
        {" · "}
        RAG Lab — soporte y mejoras vía{" "}
        <a
          href="https://github.com/ragapp/ragapp/issues/"
          className="text-primary underline-offset-2 hover:underline"
        >
          GitHub (RAGapp upstream)
        </a>
        .
      </p>
    </footer>
  );
};

export { Footer };
