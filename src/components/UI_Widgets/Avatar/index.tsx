import React, { FC } from "react";
import defaultImagePath from "./assets/svg/photo-holder.svg";

export enum AvatarSizes {
  Tiny="tn",
  Small= "sm",
  Medium= "md",
  Large= "lg"
}

export interface AvatarProps extends React.ComponentPropsWithRef<"div"> {
  size?: AvatarSizes;
  src?: string;
  letters?: string;
}
  
const Avatar: React.FC<AvatarProps> = ({
  size = AvatarSizes.Small,
  src = defaultImagePath,
  className, 
  letters
}: AvatarProps) => {
  React.useEffect(() => {  
    const styleSheetsOnly = [].slice.call(
      window.document.styleSheets
    ).filter(
      (sheet) => sheet.ownerNode.nodeName === "STYLE"
    ).map(
      (sheet) => sheet.ownerNode.id
    ).filter(
      (id) => id !== ""
    );

    if (styleSheetsOnly.length === 0
      || stlyeSheetsOnly.includes("react-busser-headless-ui_avatar")) {
      return;
    }

    const avatarStyle = window.document.createElement('style');
    avatarStyle.id = "react-busser-headless-ui_avatar";

    avatarStyle.innerHTML = `  
      .avatar_wrapper-box {
        display: inline-flex;
        display: inline-block;
        overflow: hidden;
      }

      .avatar_letter-box {
        display: inline-block;
        vertical-align: middle;
        text-transform: uppercase;
        text-align: center;
        position: relative;
      }
    
      .avatar_image-box {
        object-fit: cover;
        width: 100%;
        display: inline-block;
        height: auto;
      }
    `;  
    window.document.head.appendChild(avatarStyle);  
 
    return () => {  
      window.document.head.removeChild(avatarStyle);  
    };  
  }, []);

  return (
    <div className={`${className} avatar_wrapper-box`} data-letter={letters ? letters : undefined}>
      {letters ? <span className="avatar_letter-box">{letters}</span> : <img alt="avatar" className="avatar_image-box" src={src} />}
    </div>
  );
};
