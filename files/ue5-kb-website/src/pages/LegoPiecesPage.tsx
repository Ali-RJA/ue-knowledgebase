import { Box, Container, Typography } from '@mui/material';@
@
export const LegoPiecesPage = () => {@
  return (@
    <Container maxWidth="lg" sx={{ py: 4 }}>@
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>@
        Lego Pieces@
      </Typography>@
      <Typography variant="body1" color="text.secondary" paragraph>@
        Reusable C++ code snippets and patterns for Unreal Engine development.@
      </Typography>@
@
      <Box sx={{ textAlign: 'center', py: 8 }}>@
        <Typography variant="h6" color="text.secondary">@
          Coming soon - Lego pieces will be extracted from the HTML collection@
        </Typography>@
      </Box>@
    </Container>@
  );@
};@
