import { Star, Visibility } from "@mui/icons-material";
import { Box, Badge, Typography, LinearProgress } from "@mui/material";
import { PersonStats } from "../../common/types/api";
import { round } from "@rhodesjason/loxdb/dist/lib/round";
import { PersonImage } from "./PersonImage";

export interface StatsDisplayOptions {
  people: PersonStats[];
  setDetails: (person: PersonStats) => void;
  isLoading: boolean;
}

export function CardsPersonStats({ people, setDetails, isLoading }: StatsDisplayOptions) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {isLoading ? <LinearProgress /> : people.map((person, i) => (
        <Box 
          key={person.id} 
          sx={{ 
            width: 250, 
            display: 'flex', 
            marginRight: 1, 
            marginBottom: 4, 
            padding: 2,
            cursor: "pointer",
            opacity: 0.9,
            transition: 'all 0.3s ease-out',
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(0,0,0,0.2)'
            }
          }}
          onClick={() => setDetails(person)}
        >
          <Badge sx={{ ["& .MuiBadge-badge"]: { border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 2px 2px rgba(0,0,0,0.3)', textShadow: '1px 1px 0 rgba(255,255,255,0.6)' }}} color="secondary" badgeContent={i + 1} anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}>
            <PersonImage path={person.profilePath} />
          </Badge>
          <Box>
            <Typography color="primary" component="h3" variant="body1" sx={{ marginBottom: 1 }}>{person.name}</Typography>
            <Typography component="div" variant="caption" sx={{ verticalAlign: 'middle', opacity: 0.6 }}>
              <Star fontSize="small" />
              {' '}
              <span style={{ position: 'relative', top: -5, left: 2 }}>{round(person.averageRating)}</span>
            </Typography>
            <Typography component="div" variant="caption" sx={{ opacity: 0.6 }}>
              <Visibility fontSize="small" />
              {' '}
              <span style={{ position: 'relative', top: -5, left: 2 }}>{person.countRated}</span>
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export function ListPersonStats({ 
  people, 
  setDetails, 
  splitNumber,
  isLoading
}: StatsDisplayOptions & { splitNumber: number }) {
  return (
    <Box>
      {isLoading ? <LinearProgress /> : people.map((person, i) => (
        <Box 
          key={person.id} 
          sx={{ 
            marginBottom: 1, 
            paddingLeft: 5,
            py: 1,
            position: "relative",
            cursor: "pointer",
            transition: 'all 0.3s ease-out',
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.2)"
            }
          }}
          onClick={() => setDetails(person)}
        >
          <Typography component="span" sx={{ mr: 2 }}>{person.name}</Typography>
          <Typography variant="caption" sx={{ fontSize: "12px", mr: 2, opacity: 0.7 }}>
            <Star fontSize="inherit" sx={{ mb: "-1px" }} />
            {' '}
            {round(person.averageRating)}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "12px", mr: 2, opacity: 0.7 }}>
            <Visibility fontSize="inherit" sx={{ mb: "-1px" }} />
            {' '}
            {person.countRated}
          </Typography>
          <Box sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8,
            backgroundColor: "secondary.main",
            color: "#000",
            borderRadius: "20px",
            padding: "2px 4px",
            fontSize: "12px"
          }}>
            {i + (splitNumber + 1)}
          </Box>
        </Box>
      ))}
    </Box>
  )
}