import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Item } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { MagicalItem } from "@/components/inventory/MagicalItem";

// Define the form schema
const formSchema = z.object({
  itemType: z.string().min(1, "Item type is required"),
  rarity: z.enum(["Common", "Uncommon", "Rare", "Epic", "Legendary"]),
  primaryStat: z.enum(["magicPower", "wisdom", "agility"]),
  theme: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ItemGenerator() {
  const { toast } = useToast();
  const [generatedItem, setGeneratedItem] = useState<Item | null>(null);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemType: "",
      rarity: "Common",
      primaryStat: "magicPower",
      theme: "",
    },
  });
  
  // Set up the mutation for generating an item
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/ai/generate-magical-item", data);
      const jsonResponse = await res.json();
      return jsonResponse.item as Item;
    },
    onSuccess: (data) => {
      setGeneratedItem(data);
      toast({
        title: "Item Generated!",
        description: `Your ${data.rarity} ${data.name} has been created.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  function onSubmit(data: FormValues) {
    mutation.mutate(data);
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="mr-2 h-5 w-5" />
            Magical Item Generator
          </CardTitle>
          <CardDescription>
            Create unique magical items for your educational adventure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Wand, Amulet, Boots, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      The type of magical item to create
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rarity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rarity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Common">Common</SelectItem>
                        <SelectItem value="Uncommon">Uncommon</SelectItem>
                        <SelectItem value="Rare">Rare</SelectItem>
                        <SelectItem value="Epic">Epic</SelectItem>
                        <SelectItem value="Legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Higher rarity items have better stats
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="primaryStat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Stat</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary stat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="magicPower">Magic Power</SelectItem>
                        <SelectItem value="wisdom">Wisdom</SelectItem>
                        <SelectItem value="agility">Agility</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The main stat this item will boost
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Space, Ocean, Forest, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      A theme to inspire the item's design
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Magical Item"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {generatedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Item</CardTitle>
            <CardDescription>
              Your magical item awaits!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MagicalItem item={generatedItem} isOwned={false} />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setGeneratedItem(null)}>
              Clear
            </Button>
            <Button>
              Save to Library
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}