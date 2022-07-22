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

  // const filtered = ratings.filter((r) => r.movie)

  const getRowId = React.useCallback((row: typeof ratings[number]) => row.name + '-' + row.date, []);
  
  return (
    <DataGrid
      getRowId={(row) => row.name + '-' + row.date}
      getRowHeight={(options) => {
        return 100;
      }}
      autoHeight={true}
      sx={{
        width: '100%'
      }}
      rows={ratings}
      columns={[
        // {
        //   field: "movie.posterPath",
        //   headerName: "",
        //   sortable: false,
        //   align: "left",
        //   width: 80,
        //   renderCell: ({ row }) => {
        //     console.log(row);
        //     return row.movie && row.movie.posterPath
        //       ? <BasicImage sx={{ height: '100px', width: 'auto' }} path={row.movie.posterPath} />
        //       : null;
        //   }
        // },
        {
          field: "name",
          headerName: "Title",
          flex: 150,
          // renderCell: ({ row }) => row.movie.title
        },
        {
          field: "stars",
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