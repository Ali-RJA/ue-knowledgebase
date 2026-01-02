import { Box, Container, Typography, Paper, Divider } from '@mui/material';

export const AboutPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
        About This Knowledge Base
      </Typography>

      <Paper sx={{ p: 4, my: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Overview
        </Typography>
        <Typography variant="body1" paragraph>
          This knowledge base documents 10 interconnected systems for building a Ghost of Tsushima-style
          melee combat game in Unreal Engine 5. Each document provides architectural diagrams, component
          specifications, implementation patterns, and quick reference cards.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom fontWeight={600}>
          Project Information
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" paragraph>
            <strong>Project:</strong> Hattin (Battle of Hattin era, 1187 CE)
          </Typography>
          <Typography component="li" paragraph>
            <strong>Engine:</strong> Unreal Engine 5
          </Typography>
          <Typography component="li" paragraph>
            <strong>Combat Style:</strong> Third-person melee with lock-on targeting
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom fontWeight={600}>
          How to Use
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Topics:</strong> Browse comprehensive guides organized by category (Architecture, Core Systems,
          Control, Design Patterns). Each topic covers a specific system with detailed explanations.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Diagrams:</strong> Visual representations of system flows and architectures using Mermaid.
          Click to view fullscreen for better clarity.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Lego Pieces:</strong> Reusable code snippets and patterns that can be directly used in your
          UE5 projects.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Collections:</strong> Comprehensive HTML-based resources including the AnimNotify architecture
          and common C++ patterns library.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Tags:</strong> Click on any tag to find related content across all sections.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Search:</strong> Use the search bar in the header to quickly find topics, tags, or content.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom fontWeight={600}>
          Core Architectural Pattern
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Component-First Design:</strong> Thin characters with fat components for maximum reusability.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Combat Pipeline:</strong> Input → GAS → Animation → Collision → Damage
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Data Philosophy:</strong> Data-driven configuration with soft references for scalable systems.
        </Typography>
      </Paper>
    </Container>
  );
};
