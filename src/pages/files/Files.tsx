import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Home, Star, Search, FolderPlus, Upload, Info, X } from "lucide-react";

export default function Files() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left panel */}
        <Card className="md:col-span-2">
          <CardContent className="p-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search folder or file" className="pl-9" />
            </div>
            <nav className="space-y-1 text-sm">
              <button
                className="w-full flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/50 text-left border border-transparent data-[active=true]:bg-muted/60 data-[active=true]:border-muted"
                data-active={selected === "home" || selected === null}
                onClick={() => setSelected("home")}
              >
                <Home className="w-4 h-4 text-muted-foreground" />
                Home
              </button>
              <button
                className="w-full flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/50 text-left"
                onClick={() => setSelected("favorites")}
              >
                <Star className="w-4 h-4 text-muted-foreground" />
                Favorites
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Center panel */}
        <Card className="md:col-span-7">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span>Home</span>
              </div>
              <div className="flex items-center gap-2">
                {/* New folder dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FolderPlus className="w-4 h-4" /> New folder
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>New folder</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <Label className="md:text-right text-muted-foreground">Title</Label>
                      <Input placeholder="Title" className="md:col-span-4" />
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline">Close</Button>
                      <Button>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Add files dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="w-4 h-4" /> Add files
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Add files</DialogTitle>
                    </DialogHeader>
                    <div className="rounded-lg border border-dashed p-6 min-h-[180px] flex items-center justify-center text-sm text-muted-foreground select-none">
                      Drag-and-drop documents here
                      <br />
                      (or click to browse...)
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline">Close</Button>
                      <Button>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="icon" aria-label="info">
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="h-[480px] md:h-[560px] border rounded-lg bg-muted/10 flex items-center justify-center text-sm text-muted-foreground">
              No files yet
            </div>
          </CardContent>
        </Card>

        {/* Right panel */}
        <Card className="md:col-span-3">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">Details</h2>
              <Button variant="ghost" size="icon" aria-label="close details">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Separator className="my-3" />
            <div className="h-[480px] md:h-[520px] rounded-lg border bg-muted/10 flex items-center justify-center text-center text-sm text-muted-foreground p-4">
              Select a file or folder to view its details
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
