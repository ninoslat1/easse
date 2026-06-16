const std = @import("std");

const MapEntry = extern struct {
    key_ptr: [*]u8,
    key_len: u32,
    val_ptr: [*]u8,
    val_len: u32,
};

const NodeEntry = extern struct { path_ptr: [*]u8, path_len: u32, is_leaf: u8 };

const Frame = struct {
    value: std.json.Value,
    path: []const u8,
    is_leaf: bool,
};

export fn combine_bytes(
    ptrs: [*]const [*]const u8,
    lens: [*]const u32,
    count: u32,
    out: [*]u8,
    out_len: *u32,
) void {
    var offset: u32 = 0;
    for (0..count) |i| {
        const slice = ptrs[i][0..lens[i]];
        @memcpy(out[offset..][0..slice.len], slice);
        offset += @intCast(slice.len);
    }
    out_len.* = offset;
}

export fn normalize_string(
    input: [*]const u8,
    len: u32,
    out: [*]u8,
    out_len: *u32,
) void {
    var j: u32 = 0;
    var i: u32 = 0;
    while (i < len) : (i += 1) {
        const c = input[i];
        // strip \r\n
        if (c == '\r' or c == '\n') continue;
        out[j] = c;
        j += 1;
    }
    var start: u32 = 0;
    while (start < j and out[start] == ' ') : (start += 1) {}
    if (start > 0) {
        std.mem.copyForwards(u8, out[0..j], out[start..j]);
        j -= start;
    }
    while (j > 0 and out[j - 1] == ' ') : (j -= 1) {}
    out_len.* = j;
}

export fn collect_tree_paths(
    json_ptr: [*]const u8,
    json_len: u32,
    out_entries: [*]NodeEntry,
    out_count: *u32,
    path_buf: [*]u8,
    path_buf_cap: u32,
    path_buf_used: *u32,
) i32 { // returns 0 ok, -1 error
    const allocator = std.heap.page_allocator;
    const json = json_ptr[0..json_len];

    // Parse JSON
    const parsed = std.json.parseFromSlice(
        std.json.Value,
        allocator,
        json,
        .{},
    ) catch return -1;
    defer parsed.deinit();

    var count: u32 = 0;
    var buf_offset: u32 = 0;


    var stack = std.ArrayListUnmanaged(Frame).empty;
    defer stack.deinit(allocator);

    stack.append(allocator, .{
        .value = parsed.value,
        .path = "",
        .is_leaf = false,
    }) catch return -1;

    while (stack.items.len > 0) {
        const frame = stack.pop().?;

        const path_start = buf_offset;
        const path_bytes = frame.path;
        if (buf_offset + path_bytes.len > path_buf_cap) return -1;
        @memcpy(path_buf[buf_offset..][0..path_bytes.len], path_bytes);
        buf_offset += @intCast(path_bytes.len);

        out_entries[count] = .{
            .path_ptr = path_buf + path_start,
            .path_len = @intCast(path_bytes.len),
            .is_leaf = if (frame.is_leaf) 1 else 0,
        };
        count += 1;

        if (frame.value == .object) {
            var it = frame.value.object.iterator();
            while (it.next()) |entry| {
                const key = entry.key_ptr.*;
                const child_val = entry.value_ptr.*;

                // Build child path
                const child_path = if (frame.path.len == 0)
                    key
                else blk: {
                    const buf = allocator.alloc(
                        u8,
                        frame.path.len + 1 + key.len,
                    ) catch return -1;
                    @memcpy(buf[0..frame.path.len], frame.path);
                    buf[frame.path.len] = '.';
                    @memcpy(buf[frame.path.len + 1 ..], key);
                    break :blk buf;
                };

                const is_leaf = child_val != .object;
                stack.append(allocator, .{
                    .value = child_val,
                    .path = child_path,
                    .is_leaf = is_leaf,
                }) catch return -1;
            }
        }
    }

    out_count.* = count;
    path_buf_used.* = buf_offset;
    return 0;
}
