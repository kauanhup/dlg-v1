import { useEffect } from "react";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";

const Features = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section id="features">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=1280&auto=format&fit=crop"
        bgImageSrc="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1920&auto=format&fit=crop"
        title="Recursos Poderosos"
        date="RECURSOS"
        scrollToExpand="↓ Role para expandir"
        textBlend={false}
      />
    </section>
  );
};

export default Features;