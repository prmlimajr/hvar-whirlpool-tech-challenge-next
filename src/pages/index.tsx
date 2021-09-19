import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { parseCookies } from "nookies";

import { Loader } from "../components/Loader";
import { Searchbar } from "../components/Searchbar";
import { ProductCard } from "../components/ProductCard";

import { api } from "../service/api";

import {
  Container,
  FilterArea,
  FilterHeader,
  Options,
  Option,
  ProductsArea,
} from "./styles";
import { Button } from "../components/Button";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  sku: string;
  isFavorite: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [term, setTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data } = await api.get("/products?_sort=name");

        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleSearch = async () => {
    try {
      setIsLoading(true);

      const { data } = await api.get(`/products?name_like=${term}`);
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = async (filter: string) => {
    try {
      setIsLoading(true);

      const { data } = await api.get(`/products?favorite=true`);
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrder = async (sort: string) => {
    try {
      setIsLoading(true);

      const { data } = await api.get(`/products?_sort=${sort}`);
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = async () => {
    try {
      setIsLoading(true);

      const { data } = await api.get("/products");
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>HVAR - WHIRLPOOL | HOME</title>
      </Head>

      <Container>
        {isLoading && <Loader />}

        <FilterArea>
          <FilterHeader>Filtros:</FilterHeader>

          <Searchbar
            onChange={(data) => setTerm(data)}
            onSubmit={() => handleSearch()}
          />

          <FilterHeader>Ordenar por:</FilterHeader>

          <Options>
            <Option onClick={() => handleOrder("price")}>Preço</Option>
            <Option onClick={() => handleOrder("name")}>Nome</Option>
          </Options>

          <FilterHeader>Filtros:</FilterHeader>
          <Options>
            <Option onClick={() => handleFilter("isFavorite")}>
              Favoritos
            </Option>
          </Options>

          <Button onClick={() => handleClearFilter()}>Limpar filtros</Button>
        </FilterArea>

        <ProductsArea>
          {products.map((product) => {
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product?.image}
                name={product.name}
                price={product.price}
                sku={product.sku}
                favorite={product.isFavorite}
              />
            );
          })}
        </ProductsArea>
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { ["HVAR-WHIRLPOOL_USER"]: user } = parseCookies(ctx);

  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
