import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// Define the form schema
const childProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().min(1, "Age is required"),
  startingLevel: z.enum(["beginner", "intermediate", "advanced"]),
  subjects: z.array(z.string()).min(1, "Select at least one subject"),
  avatarColor: z.string(),
  readingLevel: z.string().optional(),
  mathLevel: z.string().optional(),
  skipKnownLessons: z.boolean().optional(),
});

type ChildProfileFormValues = z.infer<typeof childProfileSchema>;

export function ChildProfileForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const form = useForm<ChildProfileFormValues>({
    resolver: zodResolver(childProfileSchema),
    defaultValues: {
      name: "",
      age: "",
      startingLevel: "beginner",
      subjects: ["math", "reading"],
      avatarColor: "primary",
      readingLevel: "0",
      mathLevel: "0",
      skipKnownLessons: false,
    },
  });
  
  const subjects = [
    { id: "math", label: "Math" },
    { id: "reading", label: "Reading" },
    { id: "science", label: "Science" },
    { id: "history", label: "History" },
  ];
  
  const avatarColors = [
    { value: "primary", className: "bg-primary" },
    { value: "accent", className: "bg-accent" },
    { value: "secondary", className: "bg-secondary" },
    { value: "purple-500", className: "bg-purple-500" },
  ];
  
  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/child-profiles", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parents", user?.id, "children"] });
      navigate("/");
    },
  });
  
  const onSubmit = (data: ChildProfileFormValues) => {
    if (!user) return;
    
    // Transform form data to match API expectations
    const profileData = {
      parentId: user.id,
      name: data.name,
      age: parseInt(data.age),
      level: 1,
      xp: 0,
      coins: 50, // Starting coins
      stats: {
        magicPower: 10,
        wisdom: 10,
        agility: 10,
      },
      equipmentSlots: {},
      preferences: {
        subjects: data.subjects,
        difficulty: data.startingLevel,
        readingLevel: parseInt(data.readingLevel || "0"),
        mathLevel: parseInt(data.mathLevel || "0"),
        skipKnownLessons: data.skipKnownLessons || false
      },
      avatarColor: data.avatarColor,
    };
    
    createProfileMutation.mutate(profileData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: 8 }, (_, i) => i + 5).map((age) => (
                    <SelectItem key={age} value={age.toString()}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="startingLevel"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Starting Level</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="beginner" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Beginner (recommended)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="intermediate" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Intermediate
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="advanced" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Advanced
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subjects"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Subject Preferences</FormLabel>
                <FormDescription>
                  Select the subjects you want to include in lessons
                </FormDescription>
              </div>
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <FormField
                    key={subject.id}
                    control={form.control}
                    name="subjects"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={subject.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(subject.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, subject.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== subject.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {subject.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="avatarColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar Customization</FormLabel>
              <div className="grid grid-cols-5 gap-3">
                {avatarColors.map((color) => (
                  <div
                    key={color.value}
                    className={`h-14 w-14 rounded-full ${color.className} flex items-center justify-center 
                      border-2 ${field.value === color.value 
                        ? `border-${color.value} shadow-[0_0_5px] shadow-${color.value}/70` 
                        : 'border-transparent'} 
                      cursor-pointer hover:border-${color.value} transition-all duration-200`}
                    onClick={() => field.onChange(color.value)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ))}
                <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center border-2 border-transparent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="skipKnownLessons"
          render={({ field }) => (
            <FormItem className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <FormLabel className="text-base">Advanced Settings</FormLabel>
                <h4 className="font-medium text-sm mb-2 mt-4">Lesson Customization</h4>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="readingLevel"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Reading Level Adjustment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Default for age" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Default for age</SelectItem>
                          <SelectItem value="-1">One level below age</SelectItem>
                          <SelectItem value="1">One level above age</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mathLevel"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Math Level Adjustment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Default for age" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Default for age</SelectItem>
                          <SelectItem value="-1">One level below age</SelectItem>
                          <SelectItem value="1">One level above age</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Skip lessons they already know
                  </FormLabel>
                </FormItem>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-primary"
            disabled={createProfileMutation.isPending}
          >
            {createProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Profile"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
