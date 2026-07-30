export const HeaderTitle = ({ title, desc }: { title: string; desc: string }) => {
  return (
    <div>
      <h1 className="text-4xl md:text-[2.75rem]font-bold tracking-tight text-foreground mb-2">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  );
};