module provenance_seal::provenance_private;

const ENoAccess: u64 = 77;

public struct CheckpointKey has key, store {
    id: UID,
    creator: address,
    session_id: vector<u8>,
    nonce: vector<u8>,
    walrus_blob_id: vector<u8>,
    content_hash: vector<u8>,
}

public fun create_key(
    session_id: vector<u8>,
    nonce: vector<u8>,
    walrus_blob_id: vector<u8>,
    content_hash: vector<u8>,
    ctx: &mut TxContext,
): CheckpointKey {
    CheckpointKey {
        id: object::new(ctx),
        creator: ctx.sender(),
        session_id,
        nonce,
        walrus_blob_id,
        content_hash,
    }
}

entry fun create_key_entry(
    session_id: vector<u8>,
    nonce: vector<u8>,
    walrus_blob_id: vector<u8>,
    content_hash: vector<u8>,
    ctx: &mut TxContext,
) {
    let key = create_key(session_id, nonce, walrus_blob_id, content_hash, ctx);
    transfer::transfer(key, ctx.sender());
}

public fun key_id(creator: address, session_id: vector<u8>, nonce: vector<u8>): vector<u8> {
    let mut id = creator.to_bytes();
    id.append(session_id);
    id.append(nonce);
    id
}

fun check_policy(id: vector<u8>, key: &CheckpointKey): bool {
    key_id(key.creator, key.session_id, key.nonce) == id
}

entry fun seal_approve(id: vector<u8>, key: &CheckpointKey) {
    assert!(check_policy(id, key), ENoAccess);
}
