import { FilterAlt } from "@mui/icons-material";
import { Box, Chip } from "@mui/material";
import { RatingsFilters } from "../../common/types/api";
import { useRatingsFilters } from "../../hooks/GlobalFiltersContext";
import { useGetCollections, useGetPeople } from "./hooks";


export function CurrentFilters() {
  const [ratingsFilters, setRatingsFilters] = useRatingsFilters();
  const searchedActors = useGetPeople(ratingsFilters.actors);
  const searchedDirectors = useGetPeople(ratingsFilters.directors);
  const searchedCollections = useGetCollections(ratingsFilters.collections);
  
  const {
    actors = [],
    collections = [],
    directors = []
  } = ratingsFilters;

  return (
    <Box>
      {searchedActors.map(person => <Chip 
        key={person.name} 
        icon={<FilterAlt />} 
        label={'Actor: ' + person.name} 
        onDelete={() => setRatingsFilters({ ...ratingsFilters, actors: actors.filter(a => a !== person.id) })} 
        sx={{ marginRight: 1, marginBottom: 1 }}
      />)}
      {searchedDirectors.map(person => <Chip 
        key={person.name} 
        icon={<FilterAlt />} 
        label={'Director: ' + person.name} 
        onDelete={() => setRatingsFilters({ ...ratingsFilters, directors: directors.filter(a => a !== person.id) })} 
        sx={{ marginRight: 1, marginBottom: 1 }}
      />)}
      {searchedCollections.map(collection => <Chip 
        key={collection.name} 
        icon={<FilterAlt />} 
        label={'Collection: ' + collection.name.replace(/ ?Collection$/, '')} 
        onDelete={() => setRatingsFilters({ ...ratingsFilters, collections: collections.filter(a => a !== collection.id) })} 
        sx={{ marginRight: 1, marginBottom: 1 }}
      />)}
    </Box>
  )
}