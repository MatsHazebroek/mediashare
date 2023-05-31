// // /** server/uploadthing.ts */
import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { getServerAuthSession } from "./auth";
import { prisma } from "./db";
const f = createUploadthing();
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  postUploader: f({ image: { maxFileCount: 1, maxFileSize: "128MB" } })
    .middleware(async (req, res) => {
      // If you throw, the user will not be able to upload
      const session = await getServerAuthSession({ req, res });
      if (!session || !session.user)
        throw new Error("Not logged in", { cause: "Not logged in" });

      const postId = req.cookies.post;
      if (typeof postId !== "string")
        throw new Error("Invalid id", { cause: "Invalid id" });
      if (prisma === undefined)
        throw new Error("Prisma is undefined", {
          cause: "Prisma is undefined",
        });
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });
      if (post === null)
        throw new Error("Post not found", { cause: "Post not found" });
      if (post.userId !== session.user.id)
        throw new Error("Not your post", { cause: "Not your post" });
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { post: post, session: session };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.post.update({
        where: { id: metadata.post.id },
        data: {
          image: file.url,
          updatedAt: metadata.post.createdAt,
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
