import httpServer from './src/app';
import env from './src/config/env';

const PORT = env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
