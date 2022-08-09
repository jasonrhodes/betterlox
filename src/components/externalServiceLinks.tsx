import { Box, Tooltip } from "@mui/material";
import Image from 'next/image';

const DEFAULT_ICON_SIZE = 20;

export function LetterboxdLink({ username, slug, size = DEFAULT_ICON_SIZE }: { username?: string; slug?: string; size?: number; }) {
  if (!username || !slug) {
    return (
      <Tooltip title="Movie data is still loading..." arrow>
        <Box>
          <Image height={size} width={size} style={{ opacity: 0.4 }} src="/img/letterboxd-icon-2.webp" alt="Letterboxd.com logo" />
        </Box>
      </Tooltip>
    )
  }
  return (
    <a target="_blank" rel="noreferrer" href={`https://letterboxd.com/${username}${slug}`}>
      <Image height={size} width={size} src="/img/letterboxd-icon-2.webp" alt="Letterboxd.com logo" />
    </a>
  );
}

export function ImdbLink({ id, size = DEFAULT_ICON_SIZE }: { id?: string; size?: number; }) {
  if (!id) {
    return (
      <Tooltip title="Movie data is still loading..." arrow>
        <Box>
          <Image height={size} width={size} style={{ opacity: 0.4 }} src="/img/imdb-icon.png" alt="Letterboxd.com logo" />
        </Box>
      </Tooltip>
    )
  }
  return (
    <a target="_blank" rel="noreferrer" href={`https://www.imdb.com/title/${id}`}>
      <Image height={size} width={size} src="/img/imdb-icon.png" alt="IMDb.com logo" />
    </a>
  );
}