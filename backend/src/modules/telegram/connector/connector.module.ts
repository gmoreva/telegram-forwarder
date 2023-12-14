import { Module } from '@nestjs/common';
import { ConnectorScene } from './connector.scene';
import { ConnectorService } from './connector.service';
import { ConnectorAdminScene } from './connectorAdmin.scene';

@Module({
  providers: [
    ConnectorScene,
    ConnectorService,
    ConnectorAdminScene,
  ],
})
export class ConnectorModule {
}
