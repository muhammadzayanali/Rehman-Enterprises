from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0003_product_sort_order"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="stock",
            field=models.PositiveIntegerField(default=1),
        ),
    ]
