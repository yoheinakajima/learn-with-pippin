import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brain, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Question, Choice } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

// Define the form schema
const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  childAge: z.coerce.number().min(5).max(15),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  count: z.coerce.number().min(1).max(10),
  previousQuestionsTopics: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuestionGenerator() {
  const { toast } = useToast();
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      childAge: 8,
      difficulty: "beginner",
      count: 3,
      previousQuestionsTopics: "",
    },
  });
  
  // Set up the mutation for generating questions
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formattedData = {
        ...data,
        previousQuestionsTopics: data.previousQuestionsTopics 
          ? data.previousQuestionsTopics.split(',').map(topic => topic.trim()) 
          : undefined
      };

      const res = await apiRequest("POST", "/api/ai/generate-questions", formattedData);
      const jsonResponse = await res.json();
      return jsonResponse.questions as Question[];
    },
    onSuccess: (data) => {
      setGeneratedQuestions(data);
      toast({
        title: "Questions Generated!",
        description: `Generated ${data.length} questions about ${form.getValues().topic}.`,
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            Question Generator
          </CardTitle>
          <CardDescription>
            Create educational questions for mini-games and quizzes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Solar System, Dinosaurs, Math, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      The educational topic to create questions about
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="childAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child's Age: {field.value}</FormLabel>
                    <FormControl>
                      <Slider 
                        min={5} 
                        max={15} 
                        step={1} 
                        value={[field.value]} 
                        onValueChange={(value) => field.onChange(value[0])} 
                      />
                    </FormControl>
                    <FormDescription>
                      Questions will be age-appropriate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How challenging the questions should be
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions: {field.value}</FormLabel>
                    <FormControl>
                      <Slider 
                        min={1} 
                        max={10} 
                        step={1} 
                        value={[field.value]} 
                        onValueChange={(value) => field.onChange(value[0])} 
                      />
                    </FormControl>
                    <FormDescription>
                      How many questions to generate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="previousQuestionsTopics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previously Covered Topics (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Earth's orbit, Addition, Light refraction" 
                        {...field} 
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated topics to avoid repeating
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
                  "Generate Questions"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="lg:col-span-3 space-y-6">
        {generatedQuestions.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Generated Questions</h2>
              <Button variant="outline" onClick={() => setGeneratedQuestions([])}>
                Clear All
              </Button>
            </div>
            
            {generatedQuestions.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                  {question.tags && question.tags.length > 0 && (
                    <CardDescription>
                      Tags: {question.tags.join(', ')}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">{question.text}</p>
                    {question.hint && (
                      <p className="mt-2 text-sm italic text-muted-foreground">
                        Hint: {question.hint}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {question.choices.map((choice: Choice) => (
                      <div 
                        key={choice.id} 
                        className={`p-3 rounded-lg border flex items-start ${
                          choice.id === question.correctAnswerId 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        {choice.id === question.correctAnswerId && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <span className="font-medium">{choice.id}:</span> {choice.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <div className="text-sm text-muted-foreground">
                    Difficulty: {question.difficulty}/5
                  </div>
                </CardFooter>
              </Card>
            ))}
            
            <div className="flex justify-end">
              <Button>
                Save All Questions
              </Button>
            </div>
          </>
        ) : (
          <Card className="flex flex-col items-center justify-center h-full p-8 border-dashed border-2">
            <Brain className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Questions Generated Yet</h3>
            <p className="text-center text-muted-foreground mt-2">
              Fill out the form and click "Generate Questions" to create educational content for your adventure.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}