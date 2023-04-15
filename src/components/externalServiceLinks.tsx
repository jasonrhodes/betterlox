import { Box, Tooltip } from "@mui/material";
import Image from "next/legacy/image";

const DEFAULT_ICON_SIZE = 20;

export function LetterboxdLink({ 
  slug, 
  title,
  releaseDate,
  size = DEFAULT_ICON_SIZE
}: { 
  slug?: string; 
  size?: number; 
  title?: string;
  releaseDate?: string;
}) {
  if (!slug) {
    if (title) {
      return (
        <LetterboxdSearchLink size={size} title={title} releaseDate={releaseDate} />
      );
    }
    return (
      <Tooltip title="Movie data unavailable" arrow>
        <Box>
          <Image height={size} width={size} style={{ opacity: 0.4 }} src="/img/letterboxd-icon-2.webp" alt="Letterboxd.com logo" />
        </Box>
      </Tooltip>
    )
  }

  return <LetterboxdIconLink url={`https://letterboxd.com${slug}`} size={size} />;
}

export function LetterboxdIconLink({ size = DEFAULT_ICON_SIZE, url }: { size?: number; url: string; }) {
  return (
    <a target="_blank" rel="noreferrer" href={url}>
      <Image height={size} width={size} src="/img/letterboxd-icon-2.webp" alt="Letterboxd.com logo" />
    </a>
  );
}

export function LetterboxdSearchLink({ 
  size = DEFAULT_ICON_SIZE, 
  title, 
  releaseDate = 'none'
}: { 
  title: string; 
  releaseDate?: string; 
  size?: number; 
}) {
  const d = new Date(releaseDate);
  const year = (d.toString() === "Invalid Date") ? '' : `(${d.getFullYear()})`;
  const url = encodeURI(`https://letterboxd.com/search/films/${title} ${year}/`);
  return <LetterboxdIconLink url={url} size={size} />
}

export function ImdbLink({
  id, 
  size = DEFAULT_ICON_SIZE,
  title,
  releaseDate
}: { 
  id?: string; 
  size?: number; 
  title?: string;
  releaseDate?: string;
}) {
  if (!id) {
    if (title) {
      return <ImdbSearchLink size={size} title={title} releaseDate={releaseDate} />;
    }
    return (
      <Tooltip title="Movie data unavailable" arrow>
        <Box>
          <Image height={size} width={size} style={{ opacity: 0.4 }} src="/img/imdb-icon.png" alt="IMDb.com logo" />
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

export function ImdbSearchLink({ 
  size, 
  title, 
  releaseDate = 'none'
}: { 
  title: string; 
  releaseDate?: string; 
  size?: number; 
}) {
  const d = new Date(releaseDate);
  const year = (d.toString() === "Invalid Date") ? '' : `(${d.getFullYear()})`;
  const url = encodeURI(`https://www.imdb.com/find?q=${title} ${year}&s=tt&ttype=ft`);
  return <ImdbIconLink url={url} size={size} />
}