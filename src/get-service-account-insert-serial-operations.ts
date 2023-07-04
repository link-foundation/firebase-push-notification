import {
  DeepClient,
  SerialOperation,
} from '@deep-foundation/deeplinks/imports/client';
import { LinkName } from './link-name';
import { PACKAGE_NAME } from './package-name';
import { createSerialOperation } from '@deep-foundation/deeplinks/imports/gql';

/**
  * Gets serial operations to insert {@link LinkName.ServiceAccount}
  * 
  * @example
  * #### Insert {@link LinkName.ServiceAccount}
 ```ts
 const serialOperations = await getServiceAccountInsertSerialOperations({
   deep
 });
 await deep.serial({
   operations: serialOperations
 })
 ```
   * #### Insert {@link LinkName.ServiceAccount} with reserved link id
  ```ts
  const reservedLinkIds = await deep.reserve(2);
  const serviceAccountLinkId = reservedLinkIds.pop();
  const containLinkId = reservedLinkIds.pop();
  
  const serialOperations = await getServiceAccountInsertSerialOperations({
    deep,
    serviceAccount: {
      title,
      body,
    },
    reservedLinkIds: {
      serviceAccountLinkId,
      containLinkId,
    }
  });
  await deep.serial({
    operations: serialOperations
  })
  ```
  */
export async function getServiceAccountInsertSerialOperations(
  param: GetServiceAccountInsertSerialOperationsParam
): Promise<Array<SerialOperation>> {
  const {
    deep,
    serviceAccount,
    containValue,
    containerLinkId,
    shouldMakeActive
  } = param;
  const { containLinkId, serviceAccountLinkId ,usesServiceAccountLinkId} = await getReservedLinkIds();
  const { containTypeLinkId, serviceAccountTypeLinkId ,usesServiceAccountTypeLinkId} = await getTypeLinkIds();
  const serialOperations = [];
  const serviceAccountInsertSerialOperation = createSerialOperation({
    type: 'insert',
    table: 'links',
    objects: {
      id: serviceAccountLinkId,
      type_id: serviceAccountTypeLinkId,
    },
  });
  serialOperations.push(serviceAccountInsertSerialOperation);
  const valueOfServiceAccountInsertSerialOperation = createSerialOperation({
    type: 'insert',
    table: 'objects',
    objects: {
      link_id: serviceAccountLinkId,
      value: serviceAccount,
    },
  });
  serialOperations.push(valueOfServiceAccountInsertSerialOperation);
  if (containerLinkId !== null) {
    const containInsertSerialOperation = createSerialOperation({
      type: 'insert',
      table: 'links',
      objects: {
        id: containLinkId,
        type_id: containTypeLinkId,
        from_id: containerLinkId || deep.linkId,
        to_id: serviceAccountLinkId,
      },
    });
    serialOperations.push(containInsertSerialOperation);
    const valueOfContainInsertSerialOperation = createSerialOperation({
      type: 'insert',
      table: 'objects',
      objects: {
        link_id: containLinkId,
        value: containValue,
      },
    });
    serialOperations.push(valueOfContainInsertSerialOperation);
  }

  if(shouldMakeActive) {
    const usesServiceAccountInsertSerialOperation = createSerialOperation({
      type: 'insert',
      table: 'links',
      objects: {
        id: usesServiceAccountLinkId,
        type_id: usesServiceAccountTypeLinkId,
        from_id: deep.linkId,
        to_id: serviceAccountLinkId,
      },
    });
    serialOperations.push(usesServiceAccountInsertSerialOperation);
  }

  return serialOperations;

  type GetReservedLinkIdsResult = Required<
    Exclude<
      GetServiceAccountInsertSerialOperationsParam['reservedLinkIds'],
      undefined
    >
  >;

  async function getReservedLinkIds(): Promise<GetReservedLinkIdsResult> {
    let result: GetReservedLinkIdsResult = {
      containLinkId: 0,
      serviceAccountLinkId: 0,
      usesServiceAccountLinkId: 0
    };
    const linksToReserveCount =
      Object.keys(result).length -
      Object.keys(param.reservedLinkIds || {}).length;
    const reservedLinkIds: number[] =
      linksToReserveCount > 0 ? await deep.reserve(linksToReserveCount) : [];
    result = {
      containLinkId:
        param.reservedLinkIds?.containLinkId ?? reservedLinkIds.pop()!,
      serviceAccountLinkId:
        param.reservedLinkIds?.serviceAccountLinkId ?? reservedLinkIds.pop()!,
      usesServiceAccountLinkId:
        param.reservedLinkIds?.usesServiceAccountLinkId ?? reservedLinkIds.pop()!,
    };
    return result;
  }

  type GetTypeLinkIdsResult = Required<
    Exclude<GetServiceAccountInsertSerialOperationsParam['typeLinkIds'], undefined>
  >;

  async function getTypeLinkIds(): Promise<GetTypeLinkIdsResult> {
    const result: GetTypeLinkIdsResult = {
      containTypeLinkId:
        param.typeLinkIds?.containTypeLinkId ||
        (await deep.id('@deep-foundation/core', 'Contain')),
      serviceAccountTypeLinkId:
        param.typeLinkIds?.serviceAccountTypeLinkId ||
        (await deep.id(PACKAGE_NAME, LinkName[LinkName.ServiceAccount])),
        usesServiceAccountTypeLinkId:
        param.typeLinkIds?.usesServiceAccountTypeLinkId ||
        (await deep.id(PACKAGE_NAME, LinkName[LinkName.UsesServiceAccount])),
    };
    return result;
  }
}

export interface GetServiceAccountInsertSerialOperationsParam {
  /**
   * Reserved link ids that will be used in the serial operations
   */
  reservedLinkIds?: {
    /**
     * Reserved link id for the serviceAccount
     */
    serviceAccountLinkId?: number;
    /**
     * Reserved link id for the contain
     */
    containLinkId?: number;
    /**
     * Reserved link id for the usesServiceAccount
     */
    usesServiceAccountLinkId?: number;
  };
  /**
   * Link ids of types that will be used in the serial operations
   */
  typeLinkIds?: {
    /**
     * Link id of the contain type
     */
    containTypeLinkId?: number;
    /**
     * Link id of the serviceAccount type
     */
    serviceAccountTypeLinkId?: number;
    /**
     * Link id of the usesServiceAccount type
     */
    usesServiceAccountTypeLinkId?: number;
  };
  /**
   * Deep Client
   */
  deep: DeepClient;
  /**
   * Service Account 
   */
  serviceAccount: string;
  /**
   * Link id of the container
   *
   * @remarks
   * If it is null, contain link will not be created
   * @defaultValue {@link GetServiceAccountInsertSerialOperationsParam.deep.linkId} if not provided or undefined
   */
  containerLinkId?: number | undefined | null;
  /**
   * Value of the contain link
   *
   * @remarks
   * If {@link GetServiceAccountInsertSerialOperationsParam.containerLinkId} is null, this will be ignored
   */
  containValue?: string | undefined;
  /**
   * If true, the link will be made active by creating a {@link LinkName.UsesServiceAccount} link pointing to it
   * 
   * @defaultValue false
   */
  shouldMakeActive?: boolean;
}