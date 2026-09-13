import React from "react";
import { Search, Home, User, Edit2, Wand2, Shapes, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-muted/30 p-8 md:p-12 lg:p-16 flex items-center justify-center font-sans">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[auto]">
        
        {/* ===================== COLORS COLUMN ===================== */}
        <div className="flex flex-col gap-6">
          {/* Primary */}
          <div className="bg-card rounded-3xl p-6 border shadow-sm flex flex-col justify-between h-48 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <span className="font-semibold text-sm">Primary</span>
              <span className="text-sm text-muted-foreground font-mono uppercase">#C5BFAE</span>
            </div>
            {/* Swatches */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 flex">
              <div className="h-full flex-1 bg-primary/20"></div>
              <div className="h-full flex-1 bg-primary/40"></div>
              <div className="h-full flex-1 bg-primary/60"></div>
              <div className="h-full flex-1 bg-primary/80"></div>
              <div className="h-full flex-1 bg-primary"></div>
            </div>
          </div>

          {/* Foreground / Secondary */}
          <div className="bg-card rounded-3xl p-6 border shadow-sm flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <span className="font-semibold text-sm">Foreground</span>
              <span className="text-sm text-muted-foreground font-mono uppercase">#171717</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 flex">
              <div className="h-full flex-1 bg-foreground/20"></div>
              <div className="h-full flex-1 bg-foreground/40"></div>
              <div className="h-full flex-1 bg-foreground/60"></div>
              <div className="h-full flex-1 bg-foreground/80"></div>
              <div className="h-full flex-1 bg-foreground"></div>
            </div>
          </div>

          {/* Background */}
          <div className="bg-card rounded-3xl p-6 border shadow-sm flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <span className="font-semibold text-sm">Background</span>
              <span className="text-sm text-muted-foreground font-mono uppercase">#FAFAFA</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 flex border-t border-border/50">
              <div className="h-full flex-1 bg-background/20 border-r border-border/20"></div>
              <div className="h-full flex-1 bg-background/40 border-r border-border/20"></div>
              <div className="h-full flex-1 bg-background/60 border-r border-border/20"></div>
              <div className="h-full flex-1 bg-background/80 border-r border-border/20"></div>
              <div className="h-full flex-1 bg-background"></div>
            </div>
          </div>
          
          {/* Muted */}
          <div className="bg-card rounded-3xl p-6 border shadow-sm flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <span className="font-semibold text-sm">Muted</span>
              <span className="text-sm text-muted-foreground font-mono uppercase">#F4F4F5</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 flex border-t border-border/50">
              <div className="h-full flex-1 bg-muted/20"></div>
              <div className="h-full flex-1 bg-muted/40"></div>
              <div className="h-full flex-1 bg-muted/60"></div>
              <div className="h-full flex-1 bg-muted/80"></div>
              <div className="h-full flex-1 bg-muted"></div>
            </div>
          </div>
        </div>

        {/* ===================== TYPOGRAPHY COLUMN ===================== */}
        <div className="flex flex-col gap-6">
          {/* Headline */}
          <div className="bg-card rounded-3xl p-8 border shadow-sm h-[19.5rem] flex flex-col justify-between">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Headline</span>
              <span className="font-mono text-xs uppercase">Geist Sans</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[120px] font-bold leading-none tracking-tighter text-foreground">Aa</span>
            </div>
          </div>

          {/* Body */}
          <div className="bg-card rounded-3xl p-8 border shadow-sm h-[19.5rem] flex flex-col justify-between">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Body</span>
              <span className="font-mono text-xs uppercase">Geist Sans</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[100px] font-medium leading-none tracking-tight text-foreground/80">Aa</span>
            </div>
          </div>

          {/* Label / Mono */}
          <div className="bg-card rounded-3xl p-8 border shadow-sm h-[19.5rem] flex flex-col justify-between">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Label</span>
              <span className="font-mono text-xs uppercase">Geist Mono</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[80px] font-mono leading-none text-foreground/60">Aa</span>
            </div>
          </div>
        </div>

        {/* ===================== COMPONENTS COLUMN ===================== */}
        <div className="flex flex-col gap-6">
          
          {/* Buttons Row */}
          <div className="bg-card rounded-3xl p-8 border shadow-sm h-48 flex flex-col justify-center gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Button className="w-full">Primary</Button>
              <Button variant="secondary" className="w-full">Secondary</Button>
              <Button variant="outline" className="w-full">Outlined</Button>
              <Button variant="ghost" className="w-full">Ghost</Button>
            </div>
          </div>

          {/* Input & Search */}
          <div className="bg-card rounded-3xl p-8 border shadow-sm h-48 flex flex-col justify-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 h-12 bg-muted/50 border-transparent focus-visible:ring-primary/20 rounded-xl" />
            </div>
          </div>
          
          {/* Navigation / Icons */}
          <div className="bg-card rounded-3xl p-8 border shadow-sm h-48 flex items-center justify-center">
            <div className="bg-muted rounded-2xl flex items-center gap-2 p-2">
              <Button size="icon" className="rounded-xl h-12 w-12 bg-foreground text-background hover:bg-foreground/90"><Home className="size-5" /></Button>
              <Button size="icon" variant="ghost" className="rounded-xl h-12 w-12 text-muted-foreground"><Search className="size-5" /></Button>
              <Button size="icon" variant="ghost" className="rounded-xl h-12 w-12 text-muted-foreground"><User className="size-5" /></Button>
            </div>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-2 gap-6 h-48">
            <div className="bg-card rounded-3xl border shadow-sm flex items-center justify-center">
              <Button size="icon" variant="outline" className="h-12 w-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 border-0">
                <Edit2 className="size-5" />
              </Button>
            </div>
            
            <div className="bg-card rounded-3xl border shadow-sm flex items-center justify-center p-4">
              <Button className="w-full h-12 rounded-xl gap-2 bg-foreground text-background hover:bg-foreground/90 border-0">
                <Edit2 className="size-4" />
                Label
              </Button>
            </div>
          </div>

          {/* Tool Grid */}
          <div className="bg-card rounded-3xl border shadow-sm h-[13.5rem] flex flex-col items-center justify-center gap-4 p-8">
            <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-3 w-full">
                <div className="h-2 w-full bg-foreground rounded-full"></div>
                <div className="h-2 w-1/3 bg-muted rounded-full"></div>
                </div>
                <div className="flex items-center gap-3 w-full">
                <div className="h-2 w-2/3 bg-foreground/60 rounded-full"></div>
                <div className="h-2 w-1/3 bg-muted rounded-full"></div>
                </div>
                <div className="flex items-center gap-3 w-full">
                <div className="h-2 w-1/2 bg-foreground/30 rounded-full"></div>
                <div className="h-2 w-1/3 bg-muted rounded-full"></div>
                </div>
            </div>
            
            <div className="flex items-center justify-between w-full mt-4">
              <Button size="icon" className="rounded-lg h-10 w-10 bg-foreground text-background"><Wand2 className="size-4" /></Button>
              <Button size="icon" variant="secondary" className="rounded-lg h-10 w-10"><Shapes className="size-4" /></Button>
              <Button size="icon" className="rounded-lg h-10 w-10 bg-foreground text-background"><Tag className="size-4" /></Button>
              <Button size="icon" className="rounded-lg h-10 w-10 bg-destructive text-destructive-foreground hover:bg-destructive/90"><Trash2 className="size-4" /></Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
