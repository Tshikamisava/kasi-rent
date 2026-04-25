import { useEffect, useState } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

type SonnerTheme = NonNullable<ToasterProps["theme"]>;

const getTheme = (): SonnerTheme => {
  if (typeof document === "undefined") return "light";

  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";

  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
};

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<SonnerTheme>(getTheme);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => setTheme(getTheme());
    mediaQuery.addEventListener("change", onMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", onMediaChange);
    };
  }, []);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
