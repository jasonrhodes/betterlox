import React from 'react';
import DataGrid from "react-data-grid";
import { StarRating } from '../components/StarRating';
import { TMDBImage } from '../components/images';
import { Rating } from '../db/entities';
import Image, { ImageProps } from 'next/image';

interface RatingsTableProps {
  ratings: Rating[] | undefined;
}

export function RatingsTable({ ratings = [] }: RatingsTableProps) {
  const getRowId = React.useCallback((row: typeof ratings[number]) => row.name + '-' + row.date, []);
  
  return (
    <DataGrid
      className="fill-grid"
      rowKeyGetter={getRowId}
      rowHeight={100}
      rows={ratings}
      columns={[
        {
          key: "movie.posterPath",
          name: "",
          sortable: false,
          width: 60,
          formatter: ({ row }) => {
            const sharedProps: Partial<ImageProps> = {
              height: 100,
              width: 66,
              layout: "responsive",
              alt: `${row.name} Poster`
            };
            return (row.movie && row.movie.posterPath) ?
              <TMDBImage
                {...sharedProps}
                tmdbPath={row.movie.posterPath}
              /> :
              <Image {...sharedProps} src="/img/no-poster.png" alt="" />;
          }
        },
        {
          key: "movie.title",
          name: "Title",
          formatter: ({ row }) => <>{row.movie?.title || row.name}</>
        },
        {
          key: "stars",
          name: "Rating",
          width: 150,
          formatter: ({ row }) => <StarRating color="primary" rating={row.stars} />
        },
        {
          key: "date",
          name: "Date",
          width: 150
        }
      ]}
    />
  )
}