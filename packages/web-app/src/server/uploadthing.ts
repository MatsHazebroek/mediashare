// // /** server/uploadthing.ts */
import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { getServerAuthSession } from "./auth";
import { prisma } from "./db";
import { utapi } from "uploadthing/server";
const f = createUploadthing();
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  postUploader: f({ image: { maxFileCount: 1, maxFileSize: "128MB" } })
    .middleware(async (req, res) => {
      // authentication validation
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
      // If you throw, the user will not be able to upload
      if (post === null)
        throw new Error("Post not found", { cause: "Post not found" });
      if (post.userId !== session.user.id)
        throw new Error("Not your post", { cause: "Not your post" });
      // Delete the old image
      if (post.image) {
        const url = new URL(post.image);
        const imageId = post.image.split("/")[post.image.split("/").length - 1];
        if (imageId && imageId.includes(".") && url.host === "uploadthing.com")
          utapi.deleteFiles(imageId).catch(console.log);
      }
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { post: post, session: session };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.post.update({
        where: { id: metadata.post.id },
        data: {
          image: file.url,
        },
      });
    }),
  bannerUploader: f({ image: { maxFileCount: 1, maxFileSize: "128MB" } })
    .middleware(async (req, res) => {
      const session = await getServerAuthSession({ req, res });
      if (!session || !session.user)
        throw new Error("Not logged in", { cause: "Not logged in" });
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: session.user.id },
      });
      if (user.banner) {
        const url = new URL(user.banner);
        const bannerId =
          user.banner.split("/")[user.banner.split("/").length - 1];
        if (
          bannerId &&
          bannerId.includes(".") &&
          url.host === "uploadthing.com"
        )
          utapi.deleteFiles(bannerId).catch(console.log);
      }
      return { session: session };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.session.user.id },
        data: {
          banner: file.url,
        },
      });
    }),
  userImageUploader: f({ image: { maxFileCount: 1, maxFileSize: "128MB" } })
    .middleware(async (req, res) => {
      console.log("efwij");
      const session = await getServerAuthSession({ req, res });
      if (!session || !session.user)
        throw new Error("Not logged in", { cause: "Not logged in" });
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: session.user.id },
      });
      if (user.image) {
        const url = new URL(user.image);
        const imageId = user.image.split("/")[user.image.split("/").length - 1];
        if (imageId && url.host === "uploadthing.com")
          utapi.deleteFiles(imageId).catch(console.log);
      }
      return { session: session };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.session.user.id },
        data: {
          image: file.url,
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
