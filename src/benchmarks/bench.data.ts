export const flatData1 = { id: 1, name: "active", status: "active" };
export const flatData2 = { id: 1, name: "active", status: "inactive" };
export const flatIdenticalData = { id: 1, name: "John Doe", status: "active" };

export const nestedData1 = { id: 1, meta: { tags: ["a", "b"], nested: { x: 1 } } };
export const nestedData2 = { id: 1, meta: { tags: ["a", "b"], nested: { x: 2 } } };
export const nestedIdenticalData = { id: 1, meta: { tags: ["a", "b"], nested: { x: 1 } } };

export const LARGE_STATIC = Array.from({ length: 450 }, (_, i) => ({
  id: i,
  uuid: "123e4567-e89b-12d3-a456-426614174000",
  title: `Product Item Number ${i}`,
  description:
    "Description text that is repeated many times to increase the byte size of this object significantly. ".repeat(
      3,
    ),
  meta: {
    category: "Electronics",
    tags: ["tech", "gadget", "new-arrival", "sale"],
    rating: 4.5,
  },
}));

export const mockHTML = `
<div class="container">
    <header class="header">
        <h1>Dashboard Report</h1>
        <nav>
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Settings</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section class="content">
            <p>Data update at: ${new Date().toISOString()}</p>
            <table>
                ${Array(20)
                  .fill(0)
                  .map(
                    (_, i) => `
                <tr>
                    <td>Item ${i}</td>
                    <td>Value ${Math.random()}</td>
                </tr>`,
                  )
                  .join("")}
            </table>
        </section>
    </main>
</div>
`;
