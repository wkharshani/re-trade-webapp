import { z } from "zod";

export const productSchema = z.object({
  name: z.string()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-]+$/, "Product name can only contain letters, numbers, spaces, and hyphens"),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  
  category: z.enum([
    "Electronics",
    "Clothing", 
    "Furniture",
    "Books",
    "Sports & Outdoors",
    "Home & Garden",
    "Automotive",
    "Other"
  ]),
  
  productType: z.enum(["household", "industrial"]),
  
  condition: z.enum(["excellent", "good", "fair"]),
  
  price: z.number()
    .min(1, "Price must be at least 1 LKR")
    .max(10000000, "Price cannot exceed 10,000,000 LKR"),
  
  location: z.string()
    .min(1, "Please select a location"),
  
  contactNumber: z.string()
    .regex(/^(\+94|0)[1-9][0-9]{8}$/, "Please enter a valid Sri Lankan phone number")
    .min(10, "Phone number must be at least 10 digits")
    .max(12, "Phone number must be less than 12 digits"),
});

export const productFormSchema = productSchema.extend({
  images: z.array(z.string())
    .min(1, "At least one image is required")
    .max(3, "Maximum 3 images allowed"),
});

export const imageUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 3 * 1024 * 1024, "File size must be less than 3MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"
    ),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ImageUploadData = z.infer<typeof imageUploadSchema>;

// Sri Lankan cities for location dropdown
export const sriLankanCities = [
  "Colombo",
  "Kandy", 
  "Galle",
  "Jaffna",
  "Negombo",
  "Anuradhapura",
  "Polonnaruwa",
  "Trincomalee",
  "Batticaloa",
  "Ampara",
  "Kurunegala",
  "Puttalam",
  "Ratnapura",
  "Kegalle",
  "Kalutara",
  "Matara",
  "Hambantota",
  "Monaragala",
  "Badulla",
  "Nuwara Eliya",
  "Matale",
  "Kandy",
  "Other"
] as const;

export const productCategories = [
  "Electronics",
  "Clothing",
  "Furniture", 
  "Books",
  "Sports & Outdoors",
  "Home & Garden",
  "Automotive",
  "Other"
] as const;

export const productTypes = [
  { value: "household", label: "Household", description: "For general consumer items used in homes" },
  { value: "industrial", label: "Industrial", description: "For products used in commercial, manufacturing, or heavy-duty settings" }
] as const;

export const productConditions = [
  { value: "excellent", label: "Excellent", description: "Item is used but well-maintained. Very minor signs of usage, fully functional" },
  { value: "good", label: "Good", description: "Noticeable signs of use (light scratches, minor wear) but still in good working condition" },
  { value: "fair", label: "Fair", description: "Heavily used with visible wear and tear, but functional. May need minor repairs" }
] as const;
