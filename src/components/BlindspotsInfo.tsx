import { Apps, Close, FilterAlt, Phishing, Sort } from "@mui/icons-material";
import { Box, Button, Drawer, IconButton, Link, List, ListItem, ListItemAvatar, SxProps, Typography } from "@mui/material";
import React, { useState } from "react";

export function BlindspotsInfo() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Box>
      <Button variant="text" onClick={() => setIsOpen(true)}>How do blindspots work?</Button>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#710000"
          }
        }}
      >
        <Box sx={{ p: { xs: 4, sm: 6 }, pt: { xs: 6 }, position: 'relative', width: { xs: 300, sm: 550, md: 700 }}}>
          <IconButton onClick={() => setIsOpen(false)} sx={{ position: 'absolute', top: 10, right: 15 }}><Close /></IconButton>
          <Typography component="h3" sx={{ mb: 1, fontSize: { xs: '18px', sm: '32px' }}}>How blindspots work</Typography>
          <Paragraph>Blindspots show you what you <em>haven&apos;t</em> seen yet, within a set of given filters. There are two main types of blindspots.</Paragraph>
          
          <Subheading text='Lox Blindspots' icon={<Phishing />} />
          <Paragraph>When your filters include an enormous set of movies (decade, genre, etc.), we show you what you haven&apos;t seen <em>from all of the movies in the Lox database</em>. This includes everything every Lox user has seen or rated, plus a selection of the 100 most popular films from every year since 1920 as well as from each of the main Letterboxd genres.</Paragraph>
          
          <Subheading text="Filmography Blindspots" icon={<Apps />} />
          <Paragraph>When you filter by actor, director, etc., the complete list of movies is much smaller, so the blindspot search will consider all of the movies that match those criteria (using <Link href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDB</Link>).</Paragraph>
          
          <Subheading text="Sorting" icon={<Sort />} />
          <Paragraph sx={{ mb: 2 }}>You can choose to sort your blindspots in many different ways. For the Lox-specific sort options, movies that are not in the Lox database will always appear at the end of those lists.</Paragraph>
          <Paragraph sx={{ mb: 0 }}><b>Lox Popularity</b></Paragraph>
          <Paragraph sx={{ mb: 2 }}>Average rating multiplied by number of users who have seen the movie.</Paragraph>
          <Paragraph sx={{ mb: 0 }}><b>Lox Most Watched</b></Paragraph>
          <Paragraph sx={{ mb: 2 }}>Number of users who have either seen or rated the movie.</Paragraph>
          <Paragraph sx={{ mb: 0 }}><b>Lox Highest Rated</b></Paragraph>
          <Paragraph sx={{ mb: 2 }}>Average of all ratings for any movie with a minimum of 5 ratings.</Paragraph>
          <Paragraph sx={{ mb: 0 }}><b>Release Date</b></Paragraph>
          <Paragraph sx={{ mb: 2 }}>All movies sorted by release date, regardless of whether they are in the Lox database.</Paragraph>
          <Paragraph sx={{ mb: 0 }}><b>Title</b></Paragraph>
          <Paragraph sx={{ mb: 2 }}>All movies will be sorted by title, regardless of whether they are in the Lox database.</Paragraph>
        </Box>
      </Drawer>
    </Box>
  )
}

function Paragraph({ children, sx = {} }: { children: React.ReactNode; sx?: SxProps; }) {
  return (
    <Typography sx={{ mb: 1, fontSize: { xs: '12px', sm: '16px' }, ...sx }}>
      {children}
    </Typography>
  )
}

function Subheading({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <Typography color="primary.light" component="h4" sx={{ mt: 4, mb: 1, fontSize: { xs: '16px', sm: '20px' }}}>
      {icon ? <Box component="span" sx={{ mr: 1, position: 'relative', top: 4 }}>{icon}</Box> : null}{text.toUpperCase()}
    </Typography>
  )
}