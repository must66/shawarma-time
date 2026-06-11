export const cloudinaryConfig = {
  cloudName: "",
  uploadPreset: "",
  folder: "shawarma-time"
};

export const cloudinaryEnabled = Boolean(
  cloudinaryConfig.cloudName &&
  cloudinaryConfig.uploadPreset
);
