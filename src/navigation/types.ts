import type { NavigatorScreenParams } from '@react-navigation/native';

export type WorkStackParamList = {
  StartWork: undefined;
  ActiveWork: { workEntryId: string };
  FinishWork: { workEntryId: string };
};

export type BottomTabParamList = {
  Dashboard: undefined;
  WorkStack: NavigatorScreenParams<WorkStackParamList>;
  History: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList>;
  AddOwner: undefined;
  AddVehicle: undefined;
  AddPayment: { workEntryId: string };
  PhotoViewer: { photoUri: string };
  WorkDetails: { workEntryId: string };
  EditWork: { workEntryId: string };
  OwnersList: undefined;
  VehiclesList: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
