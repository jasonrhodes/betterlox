import { Box, Tooltip } from "@mui/material";
import Image from 'next/image';

const DEFAULT_ICON_SIZE = 20;

export function LetterboxdLink({ username, slug, size = DEFAULT_ICON_SIZE }: { url?: string; username?: string; slug?: string; size?: number; }) {
  if (!username || !slug) {
    return (
      <Tooltip title="Movie data is still loading..." arrow>
        <Box>
          <Image height={size} width={size} style={{ opacity: 0.4 }} src="/img/letterboxd-icon-2.webp" alt="Letterboxd.com logo" />
        </Box>
      </Tooltip>
    )
  }

  return <LetterboxdIconLink url={`https://letterboxd.com/${username}${slug}`} size={size} />;
}

export function LetterboxdIconLink({ size = DEFAULT_ICON_SIZE, url }: { size?: number; url: string; }) {
  return (
    <a target="_blank" rel="noreferrer" href={url}>
      <Image height={size} width={size} src="/img/letterboxd-icon-2.webp" alt="Letterboxd.com logo" />
    </a>
  );
}

export function LetterboxdSearchLink({ size = DEFAULT_ICON_SIZE, title, releaseDate }: { title: string; releaseDate: string; size?: number;  }) {
  const d = new Date(releaseDate);
  const year = (d.toString() === "Invalid Date") ? '' : `(${d.getFullYear()})`;
  const url = encodeURI(`https://letterboxd.com/search/films/${title} ${year}/`);
  return <LetterboxdIconLink url={url} size={size} />
}

export function ImdbLink({id, size = DEFAULT_ICON_SIZE }: { id?: string; size?: number; }) {
  if (!id) {
    return (
      <Tooltip title="Movie data is still loading..." arrow>
        <Box>
          <Image height={size} width={size} style={{ opacity: 0.4 }} src="/img/imdb-icon.png" alt="Letterboxd.com logo" />
        </Box>
      </Tooltip>
    )
  }

  return <ImdbIconLink url={`https://www.imdb.com/title/${id}`} size={size} />;
}

export function ImdbIconLink({ url, size = DEFAULT_ICON_SIZE }: { url: string; size?: number }) {
  return (
    <a target="_blank" rel="noreferrer" href={url}>
      <Image height={size} width={size} src="/img/imdb-icon.png" alt="IMDb.com logo" />
    </a>
  );
}

export function ImdbSearchLink({ size, title, releaseDate }: { title: string; releaseDate: string; size?: number;  }) {
  const d = new Date(releaseDate);
  const year = (d.toString() === "Invalid Date") ? '' : `(${d.getFullYear()})`;
  const url = encodeURI(`https://www.imdb.com/find?q=${title} ${year}&s=tt&ttype=ft`);
  return <ImdbIconLink url={url} size={size} />
}