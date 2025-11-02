"use client";

import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
}

export const ImageWithFallback = (props: ImageWithFallbackProps) => {
  const { src, fallbackSrc, alt, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt ?? ''}
      onError={() => {
        if (fallbackSrc) {
          setImgSrc(fallbackSrc as string);
        }
      }}
    />
  );
};