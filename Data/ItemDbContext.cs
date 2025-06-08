using Microsoft.EntityFrameworkCore;
using Sparsha_backend.Models;

namespace Sparsha_backend.Data
{
    public class ItemDbContext : DbContext
    {
        public ItemDbContext(DbContextOptions<ItemDbContext> options) : base(options) { }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<Seller> Sellers { get; set; }
        public DbSet<LoginLog> LoggedSellers { get; set; } 
        public DbSet<ItemOfSellers> ItemOfSellers  { get; set; }
        public DbSet<Items> GlobalItems { get; set; }
        public DbSet<WishlistItems> WishlistItems { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItems> CartItems { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ItemOfSellers>()
                .HasOne(i => i.Seller)
                .WithMany(s => s.ItemOfSellers)
                .HasForeignKey(i => i.SellerId)
                .OnDelete(DeleteBehavior.Cascade);
            
        }



    }
}
