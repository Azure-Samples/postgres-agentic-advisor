import React, { useState } from 'react';
import styled from 'styled-components';
import { SkeletonBase } from '../Skeleton/Skeleton.styles';

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const SkeletonOverlay = styled(SkeletonBase)`
  position: absolute;
  inset: 0;
  border-radius: 50%;
`;

interface AvatarImageProps {
  src: string;
  alt: string;
  /** Extra styles applied to the <img> (width/height/objectFit cover are defaults) */
  imgStyle?: React.CSSProperties;
  /** Rendered in place of the image when it fails to load */
  fallback?: React.ReactNode;
}

const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, imgStyle, fallback }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) return <>{fallback ?? null}</>;

  return (
    <Wrapper>
      {!loaded && <SkeletonOverlay />}
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...imgStyle,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </Wrapper>
  );
};

export default AvatarImage;
