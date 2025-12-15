import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Item { id: number; title: string; price: string; desc?: string; added?: boolean; }
const seed: Item[] = [
  { id: 1, title: "Ad Management", price: "Rs.35,000", desc: "-" },
  { id: 2, title: "Animated Videos", price: "Rs.5,000", desc: "2 Animated Videos" },
  { id: 3, title: "App Development", price: "Rs.300", desc: "Anonymnus App Development" },
  { id: 4, title: "Backlinks", price: "Rs.20", desc: "-" },
];

export default function Store() {
  const [items, setItems] = useState<Item[]>(seed);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("-");

  const toggle = (id: number) => setItems(prev => prev.map(i => i.id===id?{...i, added: !i.added}:i));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-muted-foreground">Store</h1>
        <Button variant="gradient" size="sm">Checkout</Button>
      </div>

      <div className="flex items-center gap-2">
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-40"><SelectValue placeholder="- Category -"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="-">- Category -</SelectItem>
            <SelectItem value="services">Services</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="w-60" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.filter(i=>i.title.toLowerCase().includes(query.toLowerCase())).map((i)=> (
          <Card key={i.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-28 bg-muted flex items-center justify-center text-4xl text-muted-foreground">🛒</div>
              <div className="p-4">
                <h3 className="font-semibold">{i.title}</h3>
                <div className="text-destructive font-semibold mt-1">{i.price}</div>
                <div className="text-sm text-muted-foreground mt-1">{i.desc || '-'}</div>
                <Button className="mt-3 w-full" variant={i.added?"secondary":"default"} onClick={()=>toggle(i.id)}>
                  {i.added?"Added to cart":"Add to cart"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
