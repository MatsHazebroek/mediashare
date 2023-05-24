import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import {
  classNames,
  generateClientDropzoneAccept,
  generateMimeTypes,
} from "uploadthing/client";
import { useUploadThing } from "./react/src/useUploadThing";
import type { FileRouter } from "uploadthing/server";
import type { DANGEROUS__uploadFiles } from "uploadthing/client";
/**
 * @example
 * <UploadButton<OurFileRouter>
 *   endpoint="someEndpoint"
 *   onUploadComplete={(res) => console.log(res)}
 *   onUploadError={(err) => console.log(err)}
 * />
 */
export function UploadButton<TRouter extends void | FileRouter = void>(props: {
  endpoint: EndpointHelper<TRouter>;
  multiple?: boolean;
  onClientUploadComplete?: (
    res?: Awaited<ReturnType<typeof DANGEROUS__uploadFiles>>
  ) => void;
  onUploadError?: (error: Error) => void;
}) {
  const { startUpload, isUploading, permittedFileInfo } =
    useUploadThing<string>({
      endpoint: props.endpoint as string,
      onClientUploadComplete: props.onClientUploadComplete,
      onUploadError: props.onUploadError,
    });

  const { maxSize, fileTypes } = permittedFileInfo ?? {};

  return (
    <div className="ut-flex ut-flex-col ut-gap-1 ut-items-center ut-justify-center">
      <label className="ut-bg-blue-600 ut-rounded-md ut-w-36 ut-h-10 ut-flex ut-items-center ut-justify-center ut-cursor-pointer">
        <input
          className="ut-hidden"
          type="file"
          multiple={props.multiple}
          accept={generateMimeTypes(fileTypes ?? [])?.join(", ")}
          onChange={(e) => {
            if (!e.target.files) return;
            void startUpload(Array.from(e.target.files));
          }}
        />
        <span className="ut-px-3 ut-py-2 ut-text-white">
          {isUploading ? (
            <Spinner />
          ) : (
            `Choose File${props.multiple ? `(s)` : ``}`
          )}
        </span>
      </label>
      <div className="ut-h-[1.25rem]">
        {fileTypes && (
          <p className="ut-text-xs ut-leading-5 ut-text-gray-600">
            {`${fileTypes.includes("blob") ? "File" : fileTypes.join(", ")}`}{" "}
            {maxSize && `up to ${maxSize}`}
          </p>
        )}
      </div>
    </div>
  );
}
