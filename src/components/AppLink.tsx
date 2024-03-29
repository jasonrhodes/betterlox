import { Box, LinkProps } from '@mui/material';
import NextLink from 'next/link';

export interface AppLinkProps extends LinkProps {
  children: React.ReactChild;
}

export function AppLink({ href, children, ...rest }: AppLinkProps) {
  if (!href) {
    return null;
  }
  return (
    <NextLink href={href} passHref>
      <Box {...rest}>{children}</Box>
    </NextLink>
  );
}