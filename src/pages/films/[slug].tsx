import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { Avatar, Box, BoxProps, Grid, LinearProgress, Link, SxProps, Typography } from '@mui/material';
import { callApi } from '../../hooks/useApi';
import { PageTemplate } from '../../components/PageTemplate';
import { useRouter } from 'next/router';
import { MovieApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { CastRole, CrewRole, Movie } from "@rhodesjason/loxdb/dist/db/entities";
import { BackdropImage, PosterImage, TmdbAvatar } from '../../components/images';
import { LetterboxdIconLink } from '../../components/externalServiceLinks';
import Image from "next/legacy/image";
import { Meta } from '../../components/Meta';
import { CalendarMonth, ChairAlt } from '@mui/icons-material';

function ViewOnLetterboxd({ slug, sx = {} }: { slug?: string; sx?: SxProps; }) {
  if (!slug) {
    return null;
  }
  return (
    <Box sx={sx}>
      <Link color="#FFFFFF" underline="none" href={`https://letterboxd.com/${slug}`} target="_blank" rel="noreferrer">
        <Box sx={{ display: 'flex', alignItems: 'center', height: '30px' }}>
          <Image height={30} width={30} src="/img/letterboxd-icon-2.webp" alt="Letterboxd.com logo" />
          <Typography sx={{ ml: 1 }} component="span">View on Letterboxd</Typography>
        </Box>
      </Link>
    </Box>
  )
}

function ViewOnIMDb({ id, sx = {} }: { id?: string; sx?: SxProps; }) {
  if (!id) {
    return null;
  }
  return (
    <Box sx={sx}>
      <Link color="#FFFFFF" underline="none" href={`https://imdb.com/title/${id}`} target="_blank" rel="noreferrer">
        <Box sx={{ display: 'flex', alignItems: 'center', height: '30px' }}>
          <Image height={30} width={30} src="/img/imdb-icon.png" alt="IMDb.com logo" />
          <Typography sx={{ ml: 1 }} component="span">View on IMDb</Typography>
        </Box>
      </Link>
    </Box>
  )
}

function CastGrid({ cast }: { cast: CastRole[]; }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
      {cast.slice(0, 10).map((role) => (
        <Box key={role.creditId} sx={{ px: 2, py: 2 }}>
          <TmdbAvatar sx={{ height: { xs: 100, md: 130 }, width: { xs: 100, md: 130 }, mb: 1 }} tmdbPath={role.actor.profilePath} />
          <Typography sx={{ fontSize: { xs: '12px', sm: '14px', md: 'inherit' }}}>{role.actor.name}</Typography>
          <Typography variant="subtitle2">{role.character}</Typography>
        </Box>
      ))}
    </Box>
  )
}

function CrewGrid({ crew }: { crew: CrewRole[]; }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
      {crew.slice(0, 10).map((role) => (
        <Box key={role.creditId} sx={{ px: 2, py: 2 }}>
          <TmdbAvatar sx={{ height: { xs: 100, md: 130 }, width: { xs: 100, md: 130 }, mb: 1 }} tmdbPath={role.person.profilePath} />
          <Typography sx={{ fontSize: { xs: '12px', sm: '14px', md: 'inherit' }}}>{role.person.name}</Typography>
          <Typography variant="subtitle2">{role.job}</Typography>
        </Box>
      ))}
    </Box>
  )
}

const MetaSection: React.FC<BoxProps> = ({ children, sx, ...rest }) => (
  <Box sx={{ mb: 3, ...sx }}>{children}</Box>
);

function MovieMeta({ movie }: { movie: Movie }) {
  const director = movie.crew.find(c => c.job === 'Director');
  return (
    <Box>
      <MetaSection>
        <ViewOnLetterboxd slug={movie.letterboxdSlug} sx={{ mb: 1 }} />
        <ViewOnIMDb id={movie.imdbId} />
      </MetaSection>
      
      <MetaSection>
        <Meta icon={<CalendarMonth />} label={`Released ${(new Date(movie.releaseDate)).toLocaleDateString()}`} />
        {director ? <Meta icon={<ChairAlt />} label={`Directed by ${director.person.name}`} /> : null}
      </MetaSection>
    </Box>
  )
}

function PageContent({ movie, isLoading, error }: { movie: Movie; isLoading: boolean; error: string }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Box sx={{ mb: 1 }}>
            <PosterImage alt={movie.title + ' poster'} sx={{ display: { xs: 'none', md: 'block' }}} path={movie.posterPath} width={500} />
            <BackdropImage alt={movie.title + ' backdrop'} sx={{ display: { xs: 'block', md: 'none' }}} path={movie.backdropPath} width={900} />
          </Box>
          <MovieMeta movie={movie} />
        </Grid>
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 4 }}>
            <Typography variant='h6' component='p' sx={{ fontSize: { xs: '14px', sm: '18px', md: '22px' }}}>{movie.overview}</Typography>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h3">Cast</Typography>
            <CastGrid cast={movie.cast} />
          </Box>
          <Box>
            <Typography variant="h4" component="h3">Crew</Typography>
            <CrewGrid crew={movie.crew} />
          </Box>
        </Grid>
      </Grid>   
      
      {/*  */}
    </Box>
  );
}

const EntriesPage: NextPage = () => {
  const router = useRouter();
  const slug = singleQueryParam(router.query.slug)!;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function retrieve() {
      setIsLoading(true);
      setError('');
      const escaped = encodeURIComponent(slug);
      const response = await callApi<MovieApiResponse>(`/api/movies/${escaped}`);
      if (response.data && 'movie' in response.data) {
        setMovie(response.data.movie);
      } else {
        if (response.data && response.data.message) {
          setError(response.data.message);
        }
      }
      setIsLoading(false);
    }

    retrieve();
  }, [slug]);

  if (!movie) {
    return (
      <LinearProgress />
    );
  }

  const d = new Date(movie.releaseDate);

  return (
    <PageTemplate title={`${movie.title} (${d.getFullYear()})`}>
       <PageContent movie={movie} isLoading={isLoading} error={error} />
    </PageTemplate>
  );
};

export default EntriesPage;