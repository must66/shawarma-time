export const cloudinaryConfig = {
  cloudName: "ddvu3rr4i",
  uploadPreset: "shawarma_time",
  folder: "shawarma-time"
};

export const cloudinaryEnabled = Boolean(
  cloudinaryConfig.cloudName &&
  cloudinaryConfig.uploadPreset
);
