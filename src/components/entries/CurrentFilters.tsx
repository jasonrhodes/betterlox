import { CalendarMonth, DoNotDisturbOn, FilterAlt } from "@mui/icons-material";
import { Box, Chip, SxProps } from "@mui/material";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";
import { useGetCollections, useGetPeople } from "./hooks";

const ChipSx: SxProps = {
  marginRight: 1,
  marginBottom: 1
};

export function CurrentFilters() {
  const { globalFilters, setGlobalFilters } = useGlobalFilters();
  const searchedActors = useGetPeople(globalFilters.actors);
  const searchedDirectors = useGetPeople(globalFilters.directors);
  const searchedWriters = useGetPeople(globalFilters.writers);
  const searchedCollections = useGetCollections(globalFilters.collections);

  const {
    actors = [],
    collections = [],
    directors = [],
    writers = []
  } = globalFilters;

  return (
    <Box>
      {globalFilters.releaseDateRange?.length ? <Chip
        icon={<CalendarMonth />}
        label={'Released: ' + globalFilters.releaseDateRange.replace(/^Decade: /, '')}
        onDelete={() => setGlobalFilters({ ...globalFilters, releaseDateRange: null })}
        sx={ChipSx}
      /> : null}
      {globalFilters.genres?.length ? <Chip
        icon={<FilterAlt color="secondary" />}
        label={`Genres: ${globalFilters.genres.join(' + ')}`}
        sx={ChipSx}
      /> : null}
      {globalFilters.excludedGenres?.length ? <Chip
        icon={<DoNotDisturbOn />}
        label={'Excluded Genres: ' + globalFilters.excludedGenres?.join(', ')}
        sx={ChipSx}
      /> : null}
      {searchedActors.map(person => <Chip 
        key={person.name} 
        icon={<FilterAlt />} 
        label={'Actor: ' + person.name} 
        onDelete={() => setGlobalFilters({ ...globalFilters, actors: actors.filter(a => a !== person.id) })} 
        sx={ChipSx}
      />)}
      {searchedDirectors.map(person => <Chip 
        key={person.name} 
        icon={<FilterAlt />} 
        label={'Director: ' + person.name} 
        onDelete={() => setGlobalFilters({ ...globalFilters, directors: directors.filter(a => a !== person.id) })} 
        sx={ChipSx}
      />)}
      {searchedWriters.map(person => <Chip
        key={person.name} 
        icon={<FilterAlt />} 
        label={'Writer: ' + person.name} 
        onDelete={() => setGlobalFilters({ ...globalFilters, writers: writers.filter(a => a !== person.id) })} 
        sx={ChipSx}
      />)}
      {searchedCollections.map(collection => <Chip 
        key={collection.name} 
        icon={<FilterAlt />} 
        label={'Collection: ' + collection.name.replace(/ ?Collection$/, '')} 
        onDelete={() => setGlobalFilters({ ...globalFilters, collections: collections.filter(a => a !== collection.id) })} 
        sx={ChipSx}
      />)}
    </Box>
  )
}