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
      if (!session || !session.user) throw new Error("Not logged in");
      if (typeof req.query.id !== "string") throw new Error("Invalid id");
      await prisma.post
        .findUniqueOrThrow({
          where: { id: req.query.id },
        })
        .then((post) => {
          if (post.userId !== session.user.id) throw new Error("Not your post");
        })
        .catch(() => {
          throw new Error("Something went wrong");
        });
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { postId: req.query.id, prisma: prisma, session: session };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await metadata.prisma.post.update({
        where: { id: metadata.postId },
        data: {
          image: file.url,
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
