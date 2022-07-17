import React from 'react';
import { DataGrid } from "@mui/x-data-grid";
import { StarRating } from '../components/StarRating';
import { BasicImage } from '../components/images';
import { Rating } from '../db/entities';

interface RatingsTableProps {
  ratings: Rating[] | undefined;
}

export function RatingsTable({ ratings }: RatingsTableProps) {
  if (!ratings) {
    return null;
  }

  const filtered = ratings.filter((r) => r.movie)

  console.log(filtered);

  return (
    <DataGrid
      getRowId={(row) => row.name + '-' + row.date}
      rowHeight={100}
      sx={{
        width: '100%'
      }}
      rows={filtered}
      columns={[
        {
          field: "movie.posterPath",
          headerName: "",
          sortable: false,
          align: "left",
          width: 80,
          renderCell: ({ row }) => {
            console.log(row);
            return row.movie && row.movie.posterPath
              ? <BasicImage sx={{ height: '100px', width: 'auto' }} path={row.movie.poster_path} />
              : null;
          }
        },
        {
          field: "movie.title",
          headerName: "Title",
          flex: 150,
          renderCell: ({ row }) => row.movie.title
        },
        {
          field: "rating",
          headerName: "Rating",
          width: 150,
          renderCell: ({ value }) => <StarRating rating={value} style={{

          }} />
        },
        {
          field: "date",
          headerName: "Date",
          width: 150
        }
      ]}
    />
  )
}