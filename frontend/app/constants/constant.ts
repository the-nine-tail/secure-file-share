import { ModalType } from "../ui-components/modal/types";

export const LOADING_MODAL: {
    [key: string]: {
        title: string;
        description: string;
        type: ModalType;
        icon?: React.ReactNode;
    }
} = {
    "upload": {
        title: "Uploading File",
        description: "Please wait while we upload your file...",
        type: "loading"
    },
    "download": {
        title: "Downloading File",
        description: "Please wait while we download your file...",
        type: "loading"
    },
    "upload_success": {
        title: "Upload Success",
        description: "File uploaded successfully!",
        type: "success"
    },
    "upload_failed": {
        title: "Upload Failed",
        description: "File upload failed!",
        type: "fail"
    }
}