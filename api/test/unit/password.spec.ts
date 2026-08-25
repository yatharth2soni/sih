import * as bcrypt from 'bcrypt';

describe('Password Hashing', () => {
  const plainPassword = 'Test@1234';
  const saltRounds = 10;

  it('should hash a password and produce a different string', async () => {
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(plainPassword);
    expect(hash.length).toBeGreaterThan(50);
  });

  it('should verify a correct password against its hash', async () => {
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    const isValid = await bcrypt.compare(plainPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    const isValid = await bcrypt.compare('WrongPassword!', hash);
    expect(isValid).toBe(false);
  });

  it('should produce different hashes for the same password (salt is random)', async () => {
    const hash1 = await bcrypt.hash(plainPassword, saltRounds);
    const hash2 = await bcrypt.hash(plainPassword, saltRounds);
    expect(hash1).not.toBe(hash2);
    // But both should verify
    expect(await bcrypt.compare(plainPassword, hash1)).toBe(true);
    expect(await bcrypt.compare(plainPassword, hash2)).toBe(true);
  });
});
