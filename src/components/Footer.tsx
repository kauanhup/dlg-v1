const Footer = () => {
  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <p className="text-muted-foreground text-sm text-center">
          © 2025 SWEXTRATOR. Criado por{" "}
          <a 
            href="https://wa.me/5565996498222" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline transition-colors"
          >
            Kauan Hup
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;