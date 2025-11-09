import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase URL:", supabaseUrl ? "✓ Set" : "✗ Missing");
  console.error("Service Key:", supabaseServiceKey ? "✓ Set" : "✗ Missing");
  throw new Error("Missing Supabase environment variables");
}

// Verify we're using service_role key (not anon key)
if (!supabaseServiceKey.includes('"role":"service_role"')) {
  console.warn(
    "⚠️  Warning: You might be using the 'anon' key instead of 'service_role' key!"
  );
  console.warn(
    "This will cause RLS policy errors. Please use the service_role key from Supabase dashboard."
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Get bucket name from env
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "student-photos";

//upload function, return public url
export const uploadFile = async (
  file: Buffer,
  regNo: string,
  contentType: string,
  fileExtension: string | undefined
): Promise<string> => {
  try {
    console.log(`📤 Attempting to upload file for student: ${regNo}`);
    console.log(`📦 Bucket: ${bucketName}`);
    console.log(`📄 Content Type: ${contentType}`);

    // Create unique file name
    const sanitizedRegNo = regNo.replace(/[^a-zA-Z0-9-]/g, "-");
    const uniqueName = `${sanitizedRegNo}-${Date.now()}.${fileExtension}`;
    const filePath = `students/${uniqueName}`;

    console.log(`📝 File path: ${filePath}`);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: contentType,
        upsert: false,
      });

    if (error) {
      console.error("❌ Error uploading file to Supabase Storage:", error);
      // Some runtimes/SDKs attach status/statusCode on the error object.
      // Use a safe cast to any when logging to avoid TypeScript errors.
      const errAny = error as any;
      console.error("Error details:", {
        status: errAny?.status,
        statusCode: errAny?.statusCode,
        message: errAny?.message ?? errAny,
      });

      if (error.message.includes("row-level security")) {
        console.error("\n🔒 RLS Policy Error - Possible solutions:");
        console.error(
          "1. Make sure you're using the SERVICE_ROLE key (not anon key)"
        );
        console.error("2. Check storage policies in Supabase dashboard");
        console.error("3. Ensure the bucket exists and has proper policies");
      }

      throw error;
    }

    console.log(`✅ File uploaded successfully: ${data.path}`);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    console.log(`🔗 Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("❌ Error uploading file to Supabase Storage:", error);
    throw error;
  }
};
