import { FilterAlt } from "@mui/icons-material";
import { Box, Chip } from "@mui/material";
import { RatingsFilters } from "../../common/types/api";
import { useGetCollections, useGetPeople } from "./hooks";


export function CurrentFilters({
  filters,
  onChange
}: {
 filters: RatingsFilters;
  onChange: (filters: RatingsFilters) => void;
}) {
  const {
    actors = [],
    collections = []
  } = filters;
  const searchedActors = useGetPeople(filters.actors);
  const searchedCollections = useGetCollections(filters.collections);
  return (
    <Box>
      {searchedActors.map(person => <Chip 
        key={person.name} 
        icon={<FilterAlt />} 
        label={'Actor: ' + person.name} 
        onDelete={() => onChange({ ...filters, actors: actors.filter(a => a !== person.id) })} 
        sx={{ marginRight: 1, marginBottom: 1 }}
      />)}
      {searchedCollections.map(collection => <Chip 
        key={collection.name} 
        icon={<FilterAlt />} 
        label={'Collection: ' + collection.name} 
        onDelete={() => onChange({ ...filters, collections: collections.filter(a => a !== collection.id) })} 
        sx={{ marginRight: 1, marginBottom: 1 }}
      />)}
    </Box>
  )
}