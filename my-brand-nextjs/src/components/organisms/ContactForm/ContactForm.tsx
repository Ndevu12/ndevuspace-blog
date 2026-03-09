import React from "react";
import Input, { InputProps } from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import FormGroup, { Textarea } from "@/components/molecules/FormGroup";
import { cn } from "@/lib/utils";

// Contact Form specific component
export interface ContactFormProps {
  onSubmit?: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => void;
  className?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  className,
}) => {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      onSubmit?.(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <FormGroup orientation="horizontal">
        <Input
          name="name"
          label="Your Name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          type="email"
          label="Your Email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </FormGroup>

      <Input
        name="subject"
        label="Subject"
        placeholder="Subject"
        value={formData.subject}
        onChange={handleChange}
      />

      <Textarea
        name="message"
        label="Your Message"
        placeholder="Your Message"
        value={formData.message}
        onChange={handleChange}
        rows={6}
        required
      />

      <div className="text-center">
        <Button
          type="submit"
          loading={isSubmitting}
          loadingText="Sending..."
          disabled={isSubmitting}
        >
          Send Message
        </Button>
      </div>
    </form>
  );
};
