"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentFormSchema, type CommentFormData, type BlogComment } from "@/types/blog";
import { addComment } from "@/services/commentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CommentFormProps {
  blogId: string;
  onCommentAdded?: (comment: BlogComment) => void;
}

export function CommentForm({ blogId, onCommentAdded }: CommentFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      content: "",
    },
  });

  const onSubmit = (data: CommentFormData) => {
    startTransition(async () => {
      try {
        const newComment = await addComment(blogId, {
          name: data.name,
          email: data.email,
          content: data.content,
        });

        if (newComment) {
          toast.success("Comment submitted successfully!");
          form.reset();
          onCommentAdded?.(newComment);
        } else {
          toast.error("Failed to add comment. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting comment:", error);
        toast.error("An error occurred. Please try again.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Comment</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Share your thoughts..."
                      disabled={isPending}
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Comment"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
