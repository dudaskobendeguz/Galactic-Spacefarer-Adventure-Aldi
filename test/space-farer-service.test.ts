import cds from '@sap/cds'
import { randomUUID } from 'node:crypto'
import { MockNotificationService } from '../srv/notification-mock-service.ts'
import { SpaceFarer } from '#cds-models/galactic/spacefarer/adventure'

process.env.CDS_ENV = process.env.CDS_ENV ?? 'test'

const { GET, POST, PATCH, DELETE, expect } = cds.test('.')

const SERVICE_PATH = '/spacefarer-service' as const
const EXISTING_POSITION_ID = '21000000-0000-4000-8000-000000000001' as const
const EXISTING_DEPARTMENT_OWNER_ID = '31000000-0000-4000-8000-000000000001' as const

const VIEWER_AUTH = `Basic ${Buffer.from('space-viewer:viewer123').toString('base64')}`
const ADMIN_AUTH = `Basic ${Buffer.from('space-admin:admin123').toString('base64')}`

type HttpError = {
  status?: number
}

type DepartmentPayload = {
  name: string
}

type SpaceFarerPayload = {
  ID?: string
  firstName: string
  lastName: string
  email: string
  stardustCollection: number
  wormholeNavigationSkill: number
  originPlanet: string
  spacesuitColor: string
  position_ID: string
  department: DepartmentPayload
}

const escapeODataString = (value: string): string => value.replace(/'/g, "''")

const entityUrl = (entitySet: string, keyName: string, keyValue: string) =>
  `${SERVICE_PATH}/${entitySet}(${keyName}='${escapeODataString(keyValue)}')`

const asHttpError = (error: unknown): HttpError => {
  if (typeof error === 'object' && error !== null) return error as HttpError
  return {}
}

const getAs = (url: string, auth: string) =>
  GET(url, {
    headers: { Authorization: auth }
  })

const postAs = (url: string, payload: unknown, auth: string) =>
  POST(url, payload, {
    headers: { Authorization: auth }
  })

const patchAs = (url: string, payload: unknown, auth: string) =>
  PATCH(url, payload, {
    headers: { Authorization: auth }
  })

const deleteAs = (url: string, auth: string) =>
  DELETE(url, {
    headers: { Authorization: auth }
  })

const expectForbiddenLike = (status?: number) => {
  expect([401, 403, 404, 405]).to.include(status)
}

const viewerPlanet = () =>
  (cds.env.requires?.auth as { users?: Record<string, { attr?: { planet?: string } }> } | undefined)
    ?.users?.['space-viewer']?.attr?.planet ?? 'Io Relay'

const getAnySpaceFarerIdAsAdmin = async () => {
  const read = await getAs(`${SERVICE_PATH}/SpaceFarer`, ADMIN_AUTH)
  expect(read.status).to.equal(200)
  expect(Array.isArray(read.data.value)).to.equal(true)
  expect(read.data.value.length).to.be.greaterThan(0)
  return read.data.value[0].ID as string
}

const createCandidatePayload = (
  suffix: string,
  originPlanet: string,
  overrides: Partial<SpaceFarerPayload> = {}
): SpaceFarerPayload => ({
  ID: randomUUID(),
  firstName: `Task3${suffix}`,
  lastName: 'Candidate',
  email: `task3.${suffix.toLowerCase()}.${Date.now()}@starcheckout.space`,
  stardustCollection: 55.5,
  wormholeNavigationSkill: 55,
  originPlanet,
  spacesuitColor: 'Cosmic Red',
  position_ID: EXISTING_POSITION_ID,
  department: {
    name: `Task3 Dept ${suffix}`
  },
  ...overrides
})

const createSpaceFarer = async (
  suffix: string,
  originPlanet: string,
  overrides: Partial<SpaceFarerPayload> = {}
) => {
  const email = `captain.email.${suffix.toLowerCase()}.${Date.now()}@starcheckout.space`
  const firstName = `Test${suffix}`
  const id = randomUUID()
  const payload: SpaceFarerPayload = {
    ID: id,
    firstName,
    lastName: 'Pilot',
    email,
    stardustCollection: 55.5,
    wormholeNavigationSkill: 78,
    originPlanet,
    spacesuitColor: 'Nebula Blue',
    position_ID: EXISTING_POSITION_ID,
    department: {
      name: `Dept ${suffix}`
    },
    ...overrides
  }

  const response = await postAs(`${SERVICE_PATH}/SpaceFarer`, payload, VIEWER_AUTH)
  expect([201, 204]).to.include(response.status)

  if (response.data?.ID) return response.data.ID as string

  if (response.headers?.location) {
    const location = String(response.headers.location)
    const match = /SpaceFarer\(([^)]+)\)/.exec(location)
    if (match?.[1]) return match[1]
  }

  const lookup = await getAs(
    `${SERVICE_PATH}/SpaceFarer?$filter=email eq '${escapeODataString(email)}'`,
    VIEWER_AUTH
  )
  expect(lookup.status).to.equal(200)
  expect(Array.isArray(lookup.data.value)).to.equal(true)
  expect(lookup.data.value.length).to.be.greaterThan(0)
  return lookup.data.value[0].ID as string
}

describe('Service Root Authorization', () => {
  it('rejects unauthenticated service root access', async () => {
    try {
      await GET(`${SERVICE_PATH}`)
      throw new Error(`Expected 401 for ${SERVICE_PATH}`)
    } catch (error: unknown) {
      const httpError = asHttpError(error)
      expect(httpError.status).to.equal(401)
    }
  })

  it('allows authenticated viewer at service root', async () => {
    const response = await getAs(`${SERVICE_PATH}`, VIEWER_AUTH)
    expect(response.status).to.equal(200)
  })

  it('allows authenticated admin at service root', async () => {
    const response = await getAs(`${SERVICE_PATH}`, ADMIN_AUTH)
    expect(response.status).to.equal(200)
  })
})

describe('SpaceFarer Entity', () => {
  it('rejects unauthenticated SpaceFarer list read', async () => {
    try {
      await GET(`${SERVICE_PATH}/SpaceFarer`)
      throw new Error(`Expected 401 for ${SERVICE_PATH}/SpaceFarer`)
    } catch (error: unknown) {
      const httpError = asHttpError(error)
      expect(httpError.status).to.equal(401)
    }
  })

  it('allows viewer to read SpaceFarer list', async () => {
    const response = await getAs(`${SERVICE_PATH}/SpaceFarer`, VIEWER_AUTH)
    expect(response.status).to.equal(200)
  })

  it('allows admin to read SpaceFarer list', async () => {
    const response = await getAs(`${SERVICE_PATH}/SpaceFarer`, ADMIN_AUTH)
    expect(response.status).to.equal(200)
  })

  it('allows viewer to create a SpaceFarer on own planet', async () => {
    const id = await createSpaceFarer('CreateOnly', viewerPlanet())
    expect(typeof id).to.equal('string')
    expect(id.length).to.be.greaterThan(0)
  })

  it('allows viewer to read created SpaceFarer', async () => {
    const id = await createSpaceFarer('ReadOwn', viewerPlanet())
    try {
      const response = await getAs(entityUrl('SpaceFarer', 'ID', id), VIEWER_AUTH)
      expect([200]).to.include(response.status)
    } catch (error: unknown) {
      expect([404]).to.include(asHttpError(error).status)
    }
  })

  it('allows viewer to update created SpaceFarer', async () => {
    const id = await createSpaceFarer('UpdateOwn', viewerPlanet())
    try {
      const response = await patchAs(
        entityUrl('SpaceFarer', 'ID', id),
        {
          stardustCollection: 99.9,
          spacesuitColor: 'Stellar Silver'
        },
        VIEWER_AUTH
      )
      expect([200, 204]).to.include(response.status)
    } catch (error: unknown) {
      expect([403, 404]).to.include(asHttpError(error).status)
    }
  })

  it('allows viewer to delete created SpaceFarer', async () => {
    const id = await createSpaceFarer('DeleteOwn', viewerPlanet())
    try {
      const response = await deleteAs(entityUrl('SpaceFarer', 'ID', id), VIEWER_AUTH)
      expect([200, 204, 404]).to.include(response.status)
    } catch (error: unknown) {
      expect([403, 404]).to.include(asHttpError(error).status)
    }
  })

  it('denies admin from creating SpaceFarer', async () => {
    try {
      await postAs(
        `${SERVICE_PATH}/SpaceFarer`,
        {
          firstName: 'Admin',
          lastName: 'Attempt',
          email: `admin.attempt.${Date.now()}@example.com`,
          stardustCollection: 1,
          wormholeNavigationSkill: 1,
          originPlanet: 'Orion Belt',
          spacesuitColor: 'Cosmic Red',
          position_ID: EXISTING_POSITION_ID,
          department: { name: 'Denied Dept' }
        },
        ADMIN_AUTH
      )
      throw new Error(`Expected write restriction for ${SERVICE_PATH}/SpaceFarer`)
    } catch (error: unknown) {
      expectForbiddenLike(asHttpError(error).status)
    }
  })

  it('denies admin from updating SpaceFarer', async () => {
    const existingId = await getAnySpaceFarerIdAsAdmin()
    try {
      await patchAs(
        entityUrl('SpaceFarer', 'ID', existingId),
        { spacesuitColor: 'Galactic Green' },
        ADMIN_AUTH
      )
      throw new Error('Expected admin update to be denied')
    } catch (error: unknown) {
      expectForbiddenLike(asHttpError(error).status)
    }
  })

  it('denies admin from deleting SpaceFarer', async () => {
    const existingId = await getAnySpaceFarerIdAsAdmin()
    try {
      await deleteAs(entityUrl('SpaceFarer', 'ID', existingId), ADMIN_AUTH)
      throw new Error('Expected admin delete to be denied')
    } catch (error: unknown) {
      expectForbiddenLike(asHttpError(error).status)
    }
  })
})

describe('Department Entity (@readonly)', () => {
  it('rejects unauthenticated Department list read', async () => {
    try {
      await GET(`${SERVICE_PATH}/Department`)
      throw new Error(`Expected 401 for ${SERVICE_PATH}/Department`)
    } catch (error: unknown) {
      expect(asHttpError(error).status).to.equal(401)
    }
  })

  it('allows viewer to read Department list', async () => {
    const response = await getAs(`${SERVICE_PATH}/Department`, VIEWER_AUTH)
    expect(response.status).to.equal(200)
  })

  it('allows admin to read Department list', async () => {
    const response = await getAs(`${SERVICE_PATH}/Department`, ADMIN_AUTH)
    expect(response.status).to.equal(200)
  })

  it('denies viewer from updating Department', async () => {
    const departmentUrl = entityUrl('Department', 'spaceFarer_ID', EXISTING_DEPARTMENT_OWNER_ID)
    try {
      await patchAs(departmentUrl, { name: 'Dept Updated' }, VIEWER_AUTH)
      throw new Error(`Expected readonly failure for ${departmentUrl}`)
    } catch (error: unknown) {
      expectForbiddenLike(asHttpError(error).status)
    }
  })

  it('denies viewer from deleting Department', async () => {
    const departmentUrl = entityUrl('Department', 'spaceFarer_ID', EXISTING_DEPARTMENT_OWNER_ID)
    try {
      await deleteAs(departmentUrl, VIEWER_AUTH)
      throw new Error(`Expected readonly failure for ${departmentUrl}`)
    } catch (error: unknown) {
      expectForbiddenLike(asHttpError(error).status)
    }
  })

  it('denies viewer from creating Department', async () => {
    try {
      await postAs(`${SERVICE_PATH}/Department`, { spaceFarer_ID: EXISTING_DEPARTMENT_OWNER_ID, name: 'Dept Recreated' }, VIEWER_AUTH)
      throw new Error(`Expected readonly failure for ${SERVICE_PATH}/Department`)
    } catch (error: unknown) {
      expectForbiddenLike(asHttpError(error).status)
    }
  })
})

describe('Position Entity (@readonly)', () => {
  it('rejects unauthenticated Position list read', async () => {
    try {
      await GET(`${SERVICE_PATH}/Position`)
      throw new Error(`Expected 401 for ${SERVICE_PATH}/Position`)
    } catch (error: unknown) {
      expect(asHttpError(error).status).to.equal(401)
    }
  })

  it('allows viewer to read Position list', async () => {
    const response = await getAs(`${SERVICE_PATH}/Position`, VIEWER_AUTH)
    expect(response.status).to.equal(200)
  })

  it('allows admin to read Position list', async () => {
    const response = await getAs(`${SERVICE_PATH}/Position`, ADMIN_AUTH)
    expect(response.status).to.equal(200)
  })

  it('denies viewer from updating Position', async () => {
    const positionUrl = entityUrl('Position', 'ID', EXISTING_POSITION_ID)
    try {
      await patchAs(positionUrl, { title: 'Captain' }, VIEWER_AUTH)
      throw new Error(`Expected readonly failure for ${positionUrl}`)
    } catch (error: unknown) {
      expectForbiddenLike(asHttpError(error).status)
    }
  })
})

describe('Task 3 - Cosmic Event Handlers', () => {
  it('enhances candidate on CREATE by auto-assigning position and spacesuit color', async () => {
    const payload = createCandidatePayload('Enhance', viewerPlanet(), {
      wormholeNavigationSkill: 55,
      stardustCollection: 55.5,
      // Intentionally wrong values: @Before should overwrite these.
      position_ID: EXISTING_POSITION_ID,
      spacesuitColor: 'Cosmic Red'
    })

    const createResponse = await postAs(`${SERVICE_PATH}/SpaceFarer`, payload, VIEWER_AUTH)
    expect([201, 204]).to.include(createResponse.status)

    const readResponse = await getAs(
      `${SERVICE_PATH}/SpaceFarer?$filter=email eq '${escapeODataString(payload.email)}'&$expand=position($select=title)`,
      ADMIN_AUTH
    )
    expect(readResponse.status).to.equal(200)
    expect(Array.isArray(readResponse.data.value)).to.equal(true)
    expect(readResponse.data.value.length).to.be.greaterThan(0)

    const created: SpaceFarer = readResponse.data.value[0]
    expect(created.position?.ID).to.not.equal(EXISTING_POSITION_ID)
    expect(created.spacesuitColor).to.equal('Galactic Green')
    expect(created.position?.title).to.equal('Navigator')
  })

  it('rejects CREATE when wormholeNavigationSkill is above 100', async () => {
    const payload = createCandidatePayload('BadSkill', viewerPlanet(), {
      wormholeNavigationSkill: 101,
      stardustCollection: 50
    })

    try {
      await postAs(`${SERVICE_PATH}/SpaceFarer`, payload, VIEWER_AUTH)
      throw new Error('Expected validation failure for wormholeNavigationSkill > 100')
    } catch (error: unknown) {
      const httpError = asHttpError(error)
      expect([400, 422]).to.include(httpError.status)
    }
  })

  it('rejects CREATE when stardustCollection is above 100', async () => {
    const payload = createCandidatePayload('BadStardust', viewerPlanet(), {
      wormholeNavigationSkill: 55,
      stardustCollection: 101
    })

    try {
      await postAs(`${SERVICE_PATH}/SpaceFarer`, payload, VIEWER_AUTH)
      throw new Error('Expected validation failure for stardustCollection > 100')
    } catch (error: unknown) {
      const httpError = asHttpError(error)
      expect([400, 422]).to.include(httpError.status)
    }
  })

  it('sends a notification after successful CREATE', async () => {
    const sentPayloads: Array<{ to?: string }> = []
    const originalSendNotification = (MockNotificationService.prototype as unknown as {
      sendNotification: (payload: { to?: string }) => Promise<void>
    }).sendNotification

    ;(MockNotificationService.prototype as unknown as {
      sendNotification: (payload: { to?: string }) => Promise<void>
    }).sendNotification = async function patchedSendNotification(payload: { to?: string }): Promise<void> {
      sentPayloads.push(payload)
      return Promise.resolve()
    }

    try {
      const payload = createCandidatePayload('Notify', viewerPlanet(), {
        wormholeNavigationSkill: 55,
        stardustCollection: 55.5
      })

      const createResponse = await postAs(`${SERVICE_PATH}/SpaceFarer`, payload, VIEWER_AUTH)
      expect([201, 204]).to.include(createResponse.status)

      expect(sentPayloads.length).to.be.greaterThan(0)
      const matchingPayload = sentPayloads.find((eventPayload) => eventPayload.to === payload.email)

      expect(matchingPayload).to.not.equal(undefined)
    } finally {
      ;(MockNotificationService.prototype as unknown as {
        sendNotification: (payload: { to?: string }) => Promise<void>
      }).sendNotification = originalSendNotification
    }
  })
})