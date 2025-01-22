import Button from "@/react-busser-components/Button";
import type { ButtonProps } from "@/react-busser-components/Button";

import { hasChildren } from "...";

const DownloadFileButton = ({
  fileurl,
  filename,
  children,
  className,
  children,
  ...props
}: Omit<ButtonProps, "OnClick" | "type"> & {
  fileurl: string;
  filename: string;
}) => {
  return (
    <Button
      type="button"
      onClick={async () => {
        const url = typeof fileurl === "string" ? fileurl : "";
        const name = typeof filename === "string" ? filename : "";

        if (url === "" || name === "") {
          return;
        }

        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }}
      {...props}
      className={className}
    >
      {children}
    </Button>
  );
}

/*

import { Download } from "lucide-react";

<DownloadFileButton
  filename="x_file.txt"
  fileurl="https://x9Asjf40doUy6Trm8Lm30.object"
  className={"p-2 border-[#eef2ab] bg-gray-50 text-[#ffffff]"}
>
  <span>Download <Download size={14} /></span>
</DownloadFileButton>

*/
